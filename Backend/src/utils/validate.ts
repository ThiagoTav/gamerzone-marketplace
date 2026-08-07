import { ZodSchema } from "zod";
import { HttpError } from "./HttpError";

export function parseOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join(", ");
    throw new HttpError(400, message);
  }
  return result.data;
}
