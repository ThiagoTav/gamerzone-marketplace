/**
 * productService — CRUD de anúncios via API real.
 *
 * Contrato:
 *   getAll(filters?)        -> Promise<Product[]>
 *   getById(id)              -> Promise<Product | null>
 *   getBySellerId(sellerId)  -> Promise<Product[]> (público, só ativos)
 *   getMine()                 -> Promise<Product[]> (autenticado, todos os status)
 *   create(data)              -> Promise<Product>
 *   update(id, patch)         -> Promise<Product>
 *   remove(id)                 -> Promise<void>
 *   setStatus(id, status)     -> Promise<Product>
 */

import { apiFetch, ApiError } from "@/lib/api";
import type { Product, ProductStatus } from "@/types/product";

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: "new" | "used";
}

export type ProductInput = Omit<Product, "id" | "status" | "createdAt" | "updatedAt" | "sellerId">;

function buildQuery(filters: ProductFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.condition) params.set("condition", filters.condition);
  if (filters.minPrice != null) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice != null) params.set("maxPrice", String(filters.maxPrice));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const productService = {
  async getAll(filters: ProductFilters = {}): Promise<Product[]> {
    return apiFetch<Product[]>(`/products${buildQuery(filters)}`);
  },

  async getById(id: string): Promise<Product | null> {
    try {
      return await apiFetch<Product>(`/products/${id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },

  async getBySellerId(sellerId: string): Promise<Product[]> {
    return apiFetch<Product[]>(`/products/seller/${sellerId}`);
  },

  async getMine(): Promise<Product[]> {
    return apiFetch<Product[]>("/products/mine");
  },

  async create(data: ProductInput): Promise<Product> {
    return apiFetch<Product>("/products", { method: "POST", body: data });
  },

  async update(id: string, patch: Partial<ProductInput>): Promise<Product> {
    return apiFetch<Product>(`/products/${id}`, { method: "PUT", body: patch });
  },

  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/products/${id}`, { method: "DELETE" });
  },

  async setStatus(id: string, status: ProductStatus): Promise<Product> {
    return apiFetch<Product>(`/products/${id}/status`, { method: "PATCH", body: { status } });
  },
};
