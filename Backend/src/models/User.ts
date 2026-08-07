import { Schema, model, InferSchemaType } from "mongoose";
import { applyJSONTransform } from "../utils/toJSONPlugin";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    avatar: { type: String, default: null },
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

applyJSONTransform(userSchema);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = model("User", userSchema);
