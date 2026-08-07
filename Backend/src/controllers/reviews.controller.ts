import { Request, Response } from "express";
import { Review } from "../models/Review";
import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { parseOrThrow } from "../utils/validate";
import { reviewSchema } from "../validators/review.schema";

export const getByProduct = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
  res.json(reviews);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = parseOrThrow(reviewSchema, req.body);
  const author = await User.findById(req.session.userId);
  const review = await Review.create({
    productId: req.params.productId,
    authorId: req.session.userId,
    authorName: author!.name,
    rating: data.rating,
    comment: data.comment,
  });
  res.status(201).json(review);
});
