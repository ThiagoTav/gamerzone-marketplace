import { Request, Response } from "express";
import { Cart } from "../models/Cart";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/HttpError";
import { parseOrThrow } from "../utils/validate";
import { orderSchema, orderItemStatusSchema } from "../validators/order.schema";
import { ORDER_ITEM_TRANSITIONS } from "../constants/orderStatus";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { shippingAddress } = parseOrThrow(orderSchema, req.body);
  const userId = req.session.userId!;

  const cart = await Cart.findOne({ userId });
  const cartItems = cart ? cart.items : [];
  if (cartItems.length === 0) throw new HttpError(400, "Carrinho vazio");

  const products = await Product.find({ _id: { $in: cartItems.map((i) => i.productId) } });
  const productsById = new Map(products.map((p) => [p.id, p]));

  const orderItems: {
    productId: string;
    title: string;
    price: number;
    quantity: number;
    sellerId: unknown;
    image: string;
  }[] = [];
  // Itens já decrementados nesta tentativa — usado pra desfazer se um item
  // seguinte falhar no meio do loop (ver comentário no catch abaixo).
  const decremented: { productId: string; quantity: number }[] = [];

  try {
    for (const cartItem of cartItems) {
      const product = productsById.get(cartItem.productId.toString());
      if (!product) throw new HttpError(404, "Um dos produtos do carrinho não existe mais");
      if (product.status !== "active") {
        throw new HttpError(409, `"${product.title}" não está mais disponível`);
      }

      // Decremento atômico: o guard `stock: {$gte}` garante que, mesmo com dois
      // pedidos concorrentes pro mesmo produto, nenhum dos dois consegue vender
      // mais do que existe — não precisa de transação multi-documento pra isso.
      const updated = await Product.findOneAndUpdate(
        { _id: product.id, status: "active", stock: { $gte: cartItem.quantity } },
        { $inc: { stock: -cartItem.quantity } },
        { new: true }
      );
      if (!updated) throw new HttpError(400, `Estoque insuficiente para "${product.title}"`);

      if (updated.stock === 0) {
        updated.status = "sold";
        await updated.save();
      }
      decremented.push({ productId: product.id, quantity: cartItem.quantity });

      orderItems.push({
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: cartItem.quantity,
        sellerId: product.sellerId,
        image: product.images[0] ?? "",
      });
    }
  } catch (err) {
    // Rollback manual dos itens já decrementados nesta tentativa. O Mongo deste
    // projeto roda standalone (sem --replSet no docker-compose), então não há
    // transação multi-documento real disponível aqui — a única garantia atômica
    // é por documento (o guard acima). Se o processo morresse no meio deste
    // rollback o estoque ficaria inconsistente; é um risco de crash, não de
    // concorrência, e aceitável pro escopo deste projeto.
    for (const d of decremented) {
      const restored = await Product.findOneAndUpdate(
        { _id: d.productId },
        { $inc: { stock: d.quantity } },
        { new: true }
      );
      if (restored?.status === "sold") {
        restored.status = "active";
        await restored.save();
      }
    }
    throw err;
  }

  const total = orderItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const order = await Order.create({ buyerId: userId, items: orderItems, total, shippingAddress });
  await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

  res.status(201).json(order);
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ buyerId: req.session.userId }).sort({ createdAt: -1 });
  res.json(orders);
});

export const getSales = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.session.userId!;
  const orders = await Order.find({ "items.sellerId": userId })
    .populate<{ buyerId: { _id: unknown; name: string; email: string } | null }>("buyerId", "name email")
    .sort({ createdAt: -1 });

  // Um pedido pode ter itens de vários vendedores — cada vendedor só pode ver
  // os próprios itens, nunca o que outros venderam dentro do mesmo pedido.
  const sales = orders.map((order) => {
    const items = order.items.filter((i) => i.sellerId.toString() === userId);
    const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    return {
      id: order.id,
      buyer: order.buyerId
        ? { id: String(order.buyerId._id), name: order.buyerId.name, email: order.buyerId.email }
        : null,
      items: items.map((i) => ({
        productId: i.productId.toString(),
        title: i.title,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
        status: i.status,
      })),
      subtotal,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  });

  res.json(sales);
});

export const updateItemStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status: nextStatus } = parseOrThrow(orderItemStatusSchema, req.body);
  const userId = req.session.userId!;

  const order = await Order.findById(req.params.orderId);
  if (!order) throw new HttpError(404, "Pedido não encontrado");

  const item = order.items.find((i) => i.productId.toString() === req.params.productId);
  if (!item) throw new HttpError(404, "Item não encontrado neste pedido");

  // Deriva o papel da sessão — nunca de um campo enviado pelo client. Alguém
  // pode ser comprador E vendedor do mesmo item (nada impede comprar o próprio
  // anúncio), então os dois papéis não são mutuamente exclusivos aqui.
  const isBuyer = order.buyerId.toString() === userId;
  const isSeller = item.sellerId.toString() === userId;
  if (!isBuyer && !isSeller) throw new HttpError(403, "Você não participa deste pedido");

  const rule = ORDER_ITEM_TRANSITIONS[nextStatus];
  const roleAllowed = (isSeller && rule.actors.includes("seller")) || (isBuyer && rule.actors.includes("buyer"));
  if (!roleAllowed) throw new HttpError(403, "Você não tem permissão para esta ação");
  if (item.status !== rule.from) {
    throw new HttpError(409, `Item está em "${item.status}", não é possível mudar para "${nextStatus}"`);
  }

  item.status = nextStatus;

  if (nextStatus === "cancelled") {
    const restored = await Product.findOneAndUpdate(
      { _id: item.productId },
      { $inc: { stock: item.quantity } },
      { new: true }
    );
    if (restored?.status === "sold") {
      restored.status = "active";
      await restored.save();
    }
  }

  await order.save();
  res.json(order);
});
