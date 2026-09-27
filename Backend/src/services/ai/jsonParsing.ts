import { HttpError } from "../../utils/HttpError";

// Modelos às vezes envolvem o JSON pedido em texto ao redor (ex: "Aqui está:
// {...}") mesmo quando instruídos a responder só com JSON — tenta direto,
// e se falhar, tenta extrair o primeiro bloco {...} da resposta.
export function safeParseJson<T>(raw: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        // cai pro throw abaixo
      }
    }
    throw new HttpError(503, "Assistente de IA indisponível no momento. Tente novamente em instantes.");
  }
}
