export type OrderItemStatus = "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  sellerId: string;
  status: OrderItemStatus;
}

export interface ShippingAddress {
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface Order {
  id: string;
  buyerId: string;
  items: OrderItem[];
  total: number;
  shippingAddress: ShippingAddress;
  paymentSimulated: boolean;
  createdAt: string;
  updatedAt: string;
}

// Retorno de GET /orders/sales — mesmo "recibo" de um pedido, mas só com os
// itens do vendedor logado (nunca os de outros vendedores no mesmo pedido).
export interface SaleOrder {
  id: string;
  buyer: { id: string; name: string; email: string } | null;
  items: Omit<OrderItem, "sellerId">[];
  subtotal: number;
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}
