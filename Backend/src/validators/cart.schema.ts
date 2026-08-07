import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().min(1).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number(),
});
