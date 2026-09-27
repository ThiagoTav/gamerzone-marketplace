import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { parseOrThrow } from "../utils/validate";
import { chatRequestSchema, listingAssistantSchema } from "../validators/ai.schema";
import { runChat } from "../services/ai/chatService";
import { generateListingDraft } from "../services/ai/listingAssistant";
import { getOrGenerateReviewSummary } from "../services/ai/reviewSummary";

export const chat = asyncHandler(async (req: Request, res: Response) => {
  const { messages } = parseOrThrow(chatRequestSchema, req.body);
  const message = await runChat(messages, { userId: req.session.userId });
  res.json({ message });
});

export const listingAssistant = asyncHandler(async (req: Request, res: Response) => {
  const { bullets } = parseOrThrow(listingAssistantSchema, req.body);
  const draft = await generateListingDraft(bullets);
  res.json(draft);
});

export const reviewSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await getOrGenerateReviewSummary(req.params.productId);
  res.json(summary);
});
