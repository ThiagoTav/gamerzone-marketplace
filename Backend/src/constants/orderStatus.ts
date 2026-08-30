// Estados possíveis de um item de pedido e quem pode movê-lo de um para o outro.
// Fonte única de verdade — reaproveitada pelo model, pelo validador e pelo controller.
export const ORDER_ITEM_STATUSES = ["processing", "shipped", "delivered", "cancelled"] as const;
export type OrderItemStatus = (typeof ORDER_ITEM_STATUSES)[number];

type Actor = "buyer" | "seller";

// "processing" é sempre o estado inicial (default do schema) — nunca um destino de transição.
export const ORDER_ITEM_TRANSITIONS: Record<
  Exclude<OrderItemStatus, "processing">,
  { actors: Actor[]; from: OrderItemStatus }
> = {
  shipped: { actors: ["seller"], from: "processing" },
  delivered: { actors: ["buyer"], from: "shipped" },
  cancelled: { actors: ["buyer", "seller"], from: "processing" },
};
