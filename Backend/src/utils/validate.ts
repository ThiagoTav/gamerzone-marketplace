import { z, ZodTypeAny } from "zod";
import { HttpError } from "./HttpError";

// `T extends ZodTypeAny` (em vez de `ZodSchema<T>`) preserva a diferença entre
// o tipo de entrada e o de saída do schema — importante pra campos com
// `.default(...)`, onde a entrada é opcional mas a saída, já validada, não é.
export function parseOrThrow<T extends ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map((i) => i.message).join(", ");
    throw new HttpError(400, message);
  }
  return result.data;
}
