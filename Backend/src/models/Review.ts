import { Schema, model } from "mongoose";
import { applyJSONTransform } from "../utils/toJSONPlugin";

const reviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

reviewSchema.index({ productId: 1, createdAt: -1 });

applyJSONTransform(reviewSchema);
reviewSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.authorId;
    ret.productId = String(ret.productId);
    return ret;
  },
});

export const Review = model("Review", reviewSchema);
