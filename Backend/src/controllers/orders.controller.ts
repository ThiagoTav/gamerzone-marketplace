import { Request, Response } from "express";
import { Cart } from "../models/Cart";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/HttpError";
import { parseOrThrow } from "../utils/validate";
import { orderSchema } from "../validators/order.schema";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { shippingAddress } = parseOrThrow(orderSchema, req.body);
  const userId = req.session.userId!;

  const cart = await Cart.findOne({ userId });
  const cartItems = cart ? cart.items : [];
  if (cartItems.length === 0) throw new HttpError(400, "Carrinho vazio");

  const products = await Product.find({ _id: { $in: cartItems.map((i) => i.productId) } });
  const productsById = new Map(products.map((p) => [p.id, p]));

  const orderItems = cartItems.map((cartItem) => {
    const product = productsById.get(cartItem.productId.toString());
    if (!product || product.status !== "active") {
      throw new HttpError(409, "Um dos produtos do carrinho não está mais disponível");
    }
    return {
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: cartItem.quantity,
      sellerId: product.sellerId,
    };
  });

  const total = orderItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const order = await Order.create({
    buyerId: userId,
    items: orderItems,
    total,
    shippingAddress,
  });

  await Product.updateMany(
    { _id: { $in: orderItems.map((i) => i.productId) } },
    { $set: { status: "sold" } }
  );

  await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

  res.status(201).json(order);
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ buyerId: req.session.userId }).sort({ createdAt: -1 });
  res.json(orders);
});
