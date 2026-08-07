/**
 * cartService — carrinho mockado, persistido em localStorage.
 *
 * Formato do CartItem: { productId, quantity }
 *
 * Contrato:
 *   getCart(userId)                       -> Promise<CartItem[]>
 *   addItem(userId, productId, qty=1)     -> Promise<CartItem[]>
 *   removeItem(userId, productId)         -> Promise<CartItem[]>
 *   updateQuantity(userId, productId, q)  -> Promise<CartItem[]>
 *   clear(userId)                         -> Promise<void>
 */

const LATENCY = 150;
const key = (userId: string) => `marketplace_cart_${userId}`;

const delay = <T,>(data: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), LATENCY));

export interface CartItem {
  productId: string;
  quantity: number;
}

function load(userId: string): CartItem[] {
  const stored = localStorage.getItem(key(userId));
  return stored ? JSON.parse(stored) : [];
}

function save(userId: string, items: CartItem[]) {
  localStorage.setItem(key(userId), JSON.stringify(items));
}

export const cartService = {
  async getCart(userId: string): Promise<CartItem[]> {
    return delay(load(userId));
  },

  async addItem(userId: string, productId: string, quantity = 1): Promise<CartItem[]> {
    const items = load(userId);
    const existing = items.find((i) => i.productId === productId);
    if (existing) existing.quantity += quantity;
    else items.push({ productId, quantity });
    save(userId, items);
    return delay(items);
  },

  async removeItem(userId: string, productId: string): Promise<CartItem[]> {
    const items = load(userId).filter((i) => i.productId !== productId);
    save(userId, items);
    return delay(items);
  },

  async updateQuantity(userId: string, productId: string, quantity: number): Promise<CartItem[]> {
    let items = load(userId);
    if (quantity <= 0) {
      items = items.filter((i) => i.productId !== productId);
    } else {
      const item = items.find((i) => i.productId === productId);
      if (item) item.quantity = quantity;
    }
    save(userId, items);
    return delay(items);
  },

  async clear(userId: string): Promise<void> {
    localStorage.removeItem(key(userId));
    return delay(undefined);
  },
};
