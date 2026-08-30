import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    // Snapshot do avatar do autor no momento da avaliação (mesma lógica do
    // authorName acima) — não depende do usuário ainda existir/ter o mesmo
    // avatar depois.
    authorAvatar: { type: String, default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

reviewSchema.index({ productId: 1, createdAt: -1 });

// Transform manual (em vez de applyJSONTransform) porque este model precisa
// de tratamento extra além de id/_id/__v: esconder authorId e serializar
// productId como string — mesmo padrão usado em Product.ts.
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
