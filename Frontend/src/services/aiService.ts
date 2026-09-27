/**
 * aiService — features de IA via API real (Groq, tier gratuito).
 *
 * Contrato:
 *   chat(messages)               -> Promise<ChatMessage>       (envia o histórico completo, recebe a resposta)
 *   generateListing(bullets)     -> Promise<ListingDraft>       (rascunho de anúncio a partir de bullets soltos)
 *   getReviewSummary(productId)  -> Promise<ReviewSummary|null> (null se o produto não tem reviews ainda)
 */

import { apiFetch } from "@/lib/api";
import type { ChatMessage, ListingDraft, ReviewSummary } from "@/types/ai";

export const aiService = {
  async chat(messages: ChatMessage[]): Promise<ChatMessage> {
    const { message } = await apiFetch<{ message: ChatMessage }>("/ai/chat", {
      method: "POST",
      body: { messages },
    });
    return message;
  },

  async generateListing(bullets: string): Promise<ListingDraft> {
    return apiFetch<ListingDraft>("/ai/listing-assistant", { method: "POST", body: { bullets } });
  },

  async getReviewSummary(productId: string): Promise<ReviewSummary | null> {
    return apiFetch<ReviewSummary | null>(`/ai/products/${productId}/review-summary`);
  },
};
