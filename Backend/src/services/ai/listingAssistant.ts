import { createChatCompletion } from "./groqClient";
import { safeParseJson } from "./jsonParsing";
import { CATEGORIES } from "../../constants/categories";

export interface ListingDraft {
  title: string;
  description: string;
  specs: { key: string; value: string }[];
}

const SYSTEM_PROMPT = `Você ajuda vendedores da GamerZone a escrever anúncios de produtos gamer.
Categorias válidas: ${CATEGORIES.join(", ")}.
A partir dos bullets soltos do vendedor, gere um rascunho de anúncio.
Responda APENAS com um JSON válido, sem texto antes ou depois, no formato exato:
{"title": "string curto e chamativo", "description": "1-2 parágrafos", "specs": [{"key": "string", "value": "string"}]}
Não invente números/specs que não estejam nos bullets — inclua só o que foi informado.`;

export async function generateListingDraft(bullets: string): Promise<ListingDraft> {
  const response = await createChatCompletion({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: bullets },
    ],
  });

  return safeParseJson<ListingDraft>(response.choices[0].message.content ?? "");
}
