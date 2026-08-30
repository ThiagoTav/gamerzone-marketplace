import { z } from "zod";
import { CATEGORIES } from "../constants/categories";

export const productSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(CATEGORIES),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  condition: z.enum(["new", "used"]),
  images: z.array(z.string()).min(1),
  specs: z.record(z.string(), z.string()).default({}),
});

export const productUpdateSchema = productSchema.partial();

export const productStatusSchema = z.object({
  status: z.enum(["active", "paused", "sold"]),
});
