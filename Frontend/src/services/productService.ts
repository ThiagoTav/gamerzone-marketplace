/**
 * productService — camada de "API fake" para produtos.
 *
 * Contrato (será substituído por fetch() para API real):
 *   getAll(filters?)                 -> Promise<Product[]>
 *   getById(id)                      -> Promise<Product | null>
 *   getBySellerId(sellerId)          -> Promise<Product[]>
 *   create(data, sellerId)           -> Promise<Product>
 *   update(id, patch)                -> Promise<Product>
 *   remove(id)                       -> Promise<void>
 *   setStatus(id, status)            -> Promise<Product>
 */

import { mockProducts, Product, ProductStatus } from "@/mocks/products";

const STORAGE_KEY = "marketplace_products";
const LATENCY = 250;

const delay = <T,>(data: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), LATENCY));

function load(): Product[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockProducts));
  return mockProducts;
}

function save(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: "new" | "used";
}

export const productService = {
  async getAll(filters: ProductFilters = {}): Promise<Product[]> {
    let items = load().filter((p) => p.status === "active");
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter((p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (filters.category) items = items.filter((p) => p.category === filters.category);
    if (filters.condition) items = items.filter((p) => p.condition === filters.condition);
    if (filters.minPrice != null) items = items.filter((p) => p.price >= filters.minPrice!);
    if (filters.maxPrice != null) items = items.filter((p) => p.price <= filters.maxPrice!);
    return delay(items);
  },

  async getById(id: string): Promise<Product | null> {
    const found = load().find((p) => p.id === id) ?? null;
    return delay(found);
  },

  async getBySellerId(sellerId: string): Promise<Product[]> {
    const items = load().filter((p) => p.sellerId === sellerId);
    return delay(items);
  },

  async create(
    data: Omit<Product, "id" | "status" | "createdAt" | "sellerId">,
    sellerId: string
  ): Promise<Product> {
    const items = load();
    const newProduct: Product = {
      ...data,
      id: `p${Date.now()}`,
      status: "active",
      createdAt: new Date().toISOString(),
      sellerId,
    };
    items.push(newProduct);
    save(items);
    return delay(newProduct);
  },

  async update(id: string, patch: Partial<Product>): Promise<Product> {
    const items = load();
    const idx = items.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Produto não encontrado");
    items[idx] = { ...items[idx], ...patch };
    save(items);
    return delay(items[idx]);
  },

  async remove(id: string): Promise<void> {
    save(load().filter((p) => p.id !== id));
    return delay(undefined);
  },

  async setStatus(id: string, status: ProductStatus): Promise<Product> {
    return this.update(id, { status });
  },
};
