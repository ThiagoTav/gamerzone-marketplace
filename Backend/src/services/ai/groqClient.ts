import Groq from "groq-sdk";
import type { ChatCompletionCreateParamsNonStreaming } from "groq-sdk/resources/chat/completions";
import { env } from "../../config/env";
import { HttpError } from "../../utils/HttpError";

// Modelo usado como exemplo oficial de tool-calling na documentação da Groq.
// (llama-3.3-70b-versatile também é listado como modelo de produção, mas
// devolveu 404 "model_not_found" em teste real — provavelmente descontinuado
// ou restrito por conta; troque aqui se precisar validar outro no futuro.)
export const GROQ_MODEL = "openai/gpt-oss-120b";

const groqClient = env.GROQ_API_KEY ? new Groq({ apiKey: env.GROQ_API_KEY }) : null;

const UNAVAILABLE_MESSAGE = "Assistente de IA indisponível no momento. Tente novamente em instantes.";

// Ponto único de chamada à SDK do Groq — todo serviço de IA passa por aqui,
// nunca chama a SDK direto. Cobre tanto a chave ausente (projeto rodando sem
// IA configurada, o normal pra quem clona o repo sem gerar uma chave) quanto
// falhas reais da API (rate limit do tier gratuito, timeout, etc.) com o
// mesmo erro amigável — nunca deixa a exceção crua da SDK vazar pro cliente.
export async function createChatCompletion(
  params: Omit<ChatCompletionCreateParamsNonStreaming, "model">
) {
  if (!groqClient) throw new HttpError(503, UNAVAILABLE_MESSAGE);

  try {
    return await groqClient.chat.completions.create({ ...params, model: GROQ_MODEL, stream: false });
  } catch (err) {
    console.error("[ai] Groq error:", err);
    throw new HttpError(503, UNAVAILABLE_MESSAGE);
  }
}
