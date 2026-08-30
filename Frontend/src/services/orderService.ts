/**
 * orderService — pedidos via API real (sessão em cookie httpOnly).
 *
 * Contrato:
 *   create(shippingAddress)                       -> Promise<Order>        (finaliza a compra do carrinho atual)
 *   getMine()                                      -> Promise<Order[]>     (histórico do comprador)
 *   getSales()                                     -> Promise<SaleOrder[]> (itens vendidos, visão do vendedor)
 *   updateItemStatus(orderId, productId, status)   -> Promise<Order>       (avançar/cancelar um item)
 */

import { apiFetch } from "@/lib/api";
import type { Order, SaleOrder, OrderItemStatus, ShippingAddress } from "@/types/order";

export const orderService = {
  async create(shippingAddress: ShippingAddress): Promise<Order> {
    return apiFetch<Order>("/orders", { method: "POST", body: { shippingAddress } });
  },

  async getMine(): Promise<Order[]> {
    return apiFetch<Order[]>("/orders/mine");
  },

  async getSales(): Promise<SaleOrder[]> {
    return apiFetch<SaleOrder[]>("/orders/sales");
  },

  async updateItemStatus(
    orderId: string,
    productId: string,
    status: Extract<OrderItemStatus, "shipped" | "delivered" | "cancelled">
  ): Promise<Order> {
    return apiFetch<Order>(`/orders/${orderId}/items/${productId}/status`, {
      method: "PATCH",
      body: { status },
    });
  },
};
