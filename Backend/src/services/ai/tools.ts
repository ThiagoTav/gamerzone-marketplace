import type { ChatCompletionTool } from "groq-sdk/resources/chat/completions";
import { Product } from "../../models/Product";
import { Order } from "../../models/Order";
import { buildProductFilter } from "../productFilter";
import { CATEGORIES } from "../../constants/categories";

export interface ToolContext {
  userId?: string;
}

export const toolDefinitions: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Busca produtos ativos no catálogo da GamerZone por texto, categoria, condição e faixa de preço. Use pra qualquer pedido de busca, inclusive pedidos de 'mais barato'/'mais caro' (via sortByPrice).",
      parameters: {
        type: "object",
        properties: {
          search: { type: "string", description: "Termo livre buscado no título/categoria" },
          category: { type: "string", enum: [...CATEGORIES] },
          condition: { type: "string", enum: ["new", "used"] },
          minPrice: { type: "number" },
          maxPrice: { type: "number" },
          sortByPrice: { type: "string", enum: ["asc", "desc"], description: "asc = mais barato primeiro" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_product_details",
      description:
        "Retorna os detalhes completos de um produto por id (specs, preço, estoque, condição). Chame várias vezes pra comparar produtos diferentes.",
      parameters: {
        type: "object",
        properties: { productId: { type: "string" } },
        required: ["productId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_my_orders",
      description: "Lista os pedidos do usuário atualmente logado, com status de cada item (aguardando envio, enviado, entregue, cancelado).",
      parameters: { type: "object", properties: {} },
    },
  },
];

async function searchProducts(args: Record<string, unknown>) {
  const filter = buildProductFilter({
    search: typeof args.search === "string" ? args.search : undefined,
    category: typeof args.category === "string" ? args.category : undefined,
    condition: typeof args.condition === "string" ? args.condition : undefined,
    minPrice: typeof args.minPrice === "number" ? args.minPrice : undefined,
    maxPrice: typeof args.maxPrice === "number" ? args.maxPrice : undefined,
  });

  const sort: Record<string, 1 | -1> =
    args.sortByPrice === "asc" ? { price: 1 } : args.sortByPrice === "desc" ? { price: -1 } : { createdAt: -1 };

  const products = await Product.find(filter).sort(sort).limit(10);
  return products.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    category: p.category,
    condition: p.condition,
    stock: p.stock,
  }));
}

async function getProductDetails(args: Record<string, unknown>) {
  const productId = args.productId;
  if (typeof productId !== "string") return { error: "productId é obrigatório" };

  const product = await Product.findById(productId);
  if (!product) return { error: "Produto não encontrado" };

  return {
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    stock: product.stock,
    condition: product.condition,
    category: product.category,
    specs: Object.fromEntries(product.specs as Map<string, string>),
  };
}

async function getMyOrders(_args: Record<string, unknown>, ctx: ToolContext) {
  if (!ctx.userId) return { needsLogin: true };

  const orders = await Order.find({ buyerId: ctx.userId }).sort({ createdAt: -1 }).limit(10);
  return orders.map((o) => ({
    id: o.id,
    createdAt: o.createdAt,
    total: o.total,
    items: o.items.map((i) => ({ title: i.title, quantity: i.quantity, status: i.status })),
  }));
}

export const toolHandlers: Record<
  string,
  (args: Record<string, unknown>, ctx: ToolContext) => Promise<unknown>
> = {
  search_products: searchProducts,
  get_product_details: getProductDetails,
  get_my_orders: getMyOrders,
};
