import { Schema, model } from "mongoose";
import { applyJSONTransform } from "../utils/toJSONPlugin";
import { ORDER_ITEM_STATUSES } from "../constants/orderStatus";

const orderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Snapshot da capa do produto no momento da compra — não depende do produto
    // continuar existindo/inalterado depois (mesma lógica de title/price acima).
    image: { type: String, default: "" },
    status: { type: String, enum: ORDER_ITEM_STATUSES, default: "processing" },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema(
  {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentSimulated: { type: Boolean, default: true },
  },
  { timestamps: true }
);

orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ "items.sellerId": 1, createdAt: -1 });

applyJSONTransform(orderSchema);

export const Order = model("Order", orderSchema);
