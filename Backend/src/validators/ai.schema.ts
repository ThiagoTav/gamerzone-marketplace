import { z } from "zod";

export const chatRequestSchema = z.object({
  // O client nunca manda role "system" — evita que alguém injete uma
  // instrução de sistema pelo body da requisição.
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(30),
});

export const listingAssistantSchema = z.object({
  bullets: z.string().min(1).max(2000),
});
