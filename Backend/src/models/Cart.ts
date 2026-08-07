import { Schema, model, Types } from "mongoose";

const cartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const cartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
);

function flattenItems(items: { productId: Types.ObjectId; quantity: number }[]) {
  return items.map((i) => ({ productId: String(i.productId), quantity: i.quantity }));
}

cartSchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret: Record<string, unknown>) => {
    return { items: flattenItems(ret.items as { productId: Types.ObjectId; quantity: number }[]) };
  },
});

export const Cart = model("Cart", cartSchema);
