import { Product } from "../../models/Product";
import { Review } from "../../models/Review";
import { createChatCompletion } from "./groqClient";
import { safeParseJson } from "./jsonParsing";

export interface ReviewSummaryResult {
  pros: string[];
  cons: string[];
  reviewCount: number;
  generatedAt: Date;
}

const SYSTEM_PROMPT = `Você resume avaliações de produtos de um marketplace gamer.
A partir das avaliações reais informadas (nota de 1 a 5 e comentário), gere um resumo curto.
Responda APENAS com um JSON válido, sem texto antes ou depois, no formato exato:
{"pros": ["até 3 pontos positivos curtos"], "cons": ["até 3 pontos negativos curtos"]}
Baseie-se só no que os comentários realmente dizem — não invente. Se não houver pontos negativos claros, devolva "cons": [].`;

// Cache simples: só regenera quando o número de reviews mudou desde a última
// geração. Não pega edição de comentário sem alterar a contagem — aceitável
// pro escopo (resumo aproximado, não uma fonte de verdade jurídica).
export async function getOrGenerateReviewSummary(productId: string): Promise<ReviewSummaryResult | null> {
  const product = await Product.findById(productId);
  if (!product) return null;

  const reviews = await Review.find({ productId }).sort({ createdAt: -1 }).limit(30);
  if (reviews.length === 0) return null;

  const cached = product.reviewSummary;
  if (cached && cached.generatedAt && cached.reviewCount === reviews.length) {
    return { pros: cached.pros, cons: cached.cons, reviewCount: cached.reviewCount, generatedAt: cached.generatedAt };
  }

  const commentsText = reviews.map((r) => `- (${r.rating}/5) ${r.comment}`).join("\n");
  const response = await createChatCompletion({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: commentsText },
    ],
  });
  const parsed = safeParseJson<{ pros: string[]; cons: string[] }>(response.choices[0].message.content ?? "");

  const generatedAt = new Date();
  product.reviewSummary = { pros: parsed.pros, cons: parsed.cons, reviewCount: reviews.length, generatedAt };
  await product.save();

  return { pros: parsed.pros, cons: parsed.cons, reviewCount: reviews.length, generatedAt };
}
