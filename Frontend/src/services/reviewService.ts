/**
 * reviewService — reviews mockadas.
 *
 * Contrato:
 *   getByProductId(productId)  -> Promise<Review[]>
 *   create(data)               -> Promise<Review>
 */

import { mockReviews, Review } from "@/mocks/reviews";

const STORAGE_KEY = "marketplace_reviews";
const LATENCY = 200;

const delay = <T,>(data: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), LATENCY));

function load(): Review[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockReviews));
  return mockReviews;
}

function save(reviews: Review[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export const reviewService = {
  async getByProductId(productId: string): Promise<Review[]> {
    return delay(load().filter((r) => r.productId === productId));
  },

  async create(data: Omit<Review, "id" | "createdAt">): Promise<Review> {
    const reviews = load();
    const newReview: Review = {
      ...data,
      id: `r${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    reviews.push(newReview);
    save(reviews);
    return delay(newReview);
  },
};
