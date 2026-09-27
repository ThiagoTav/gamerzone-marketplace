import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  CLIENT_ORIGIN: z.string().url(),
  MONGODB_URI: z.string().min(1),
  SESSION_SECRET: z.string().min(10),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  // Opcional de propósito: sem essa chave o site inteiro continua funcionando,
  // só os endpoints de IA (/api/ai/*) respondem 503 — ver groqClient.ts.
  GROQ_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
