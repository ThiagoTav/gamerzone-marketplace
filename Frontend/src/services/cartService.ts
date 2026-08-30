/**
 * cartService — carrinho via API real (sessão em cookie httpOnly).
 * O Backend decide sozinho, pela sessão, se é carrinho de convidado ou de
 * usuário logado — o Frontend nunca precisa informar/gerenciar um "userId".
 *
 * Contrato:
 *   getCart()                       -> Promise<CartItem[]>
 *   addItem(productId, qty=1)       -> Promise<CartItem[]>
 *   removeItem(productId)           -> Promise<CartItem[]>
 *   updateQuantity(productId, q)    -> Promise<CartItem[]>
 *   clear()                         -> Promise<void>
 */

import { apiFetch } from "@/lib/api";

export interface CartItem {
  productId: string;
  quantity: number;
}

interface CartResponse {
  items: CartItem[];
}

export const cartService = {
  async getCart(): Promise<CartItem[]> {
    const { items } = await apiFetch<CartResponse>("/cart");
    return items;
  },

  async addItem(productId: string, quantity = 1): Promise<CartItem[]> {
    const { items } = await apiFetch<CartResponse>("/cart/items", {
      method: "POST",
      body: { productId, quantity },
    });
    return items;
  },

  async removeItem(productId: string): Promise<CartItem[]> {
    const { items } = await apiFetch<CartResponse>(`/cart/items/${productId}`, { method: "DELETE" });
    return items;
  },

  async updateQuantity(productId: string, quantity: number): Promise<CartItem[]> {
    const { items } = await apiFetch<CartResponse>(`/cart/items/${productId}`, {
      method: "PATCH",
      body: { quantity },
    });
    return items;
  },

  async clear(): Promise<void> {
    await apiFetch<void>("/cart", { method: "DELETE" });
  },
};
