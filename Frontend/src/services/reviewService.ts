/**
 * reviewService — avaliações via API real.
 *
 * Contrato:
 *   getByProductId(productId)              -> Promise<Review[]>
 *   create(productId, { rating, comment }) -> Promise<Review>
 */

import { apiFetch } from "@/lib/api";
import type { Review } from "@/types/review";

export interface ReviewInput {
  rating: number;
  comment: string;
}

export const reviewService = {
  async getByProductId(productId: string): Promise<Review[]> {
    return apiFetch<Review[]>(`/products/${productId}/reviews`);
  },

  async create(productId: string, data: ReviewInput): Promise<Review> {
    return apiFetch<Review>(`/products/${productId}/reviews`, { method: "POST", body: data });
  },
};
