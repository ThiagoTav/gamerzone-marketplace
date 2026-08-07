import { Schema } from "mongoose";

/**
 * Normalizes API responses to match the frontend's existing mock contracts:
 * _id -> id (string), drop __v, drop any field marked select:false (e.g. passwordHash).
 */
export function applyJSONTransform(schema: Schema) {
  const transform = (_doc: unknown, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  };
  schema.set("toJSON", { virtuals: true, versionKey: false, transform });
  schema.set("toObject", { virtuals: true, versionKey: false, transform });
}
