import { Schema, model, Types } from "mongoose";
import { CATEGORIES } from "../constants/categories";

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, enum: CATEGORIES },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    condition: { type: String, enum: ["new", "used"], required: true },
    status: { type: String, enum: ["active", "paused", "sold"], default: "active" },
    images: { type: [String], default: [] },
    specs: { type: Map, of: String, default: {} },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

productSchema.index({ status: 1, category: 1 });
productSchema.index({ sellerId: 1 });

productSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    if (ret.specs instanceof Map) ret.specs = Object.fromEntries(ret.specs);
    if (ret.sellerId instanceof Types.ObjectId) ret.sellerId = String(ret.sellerId);
    return ret;
  },
});

export const Product = model("Product", productSchema);
