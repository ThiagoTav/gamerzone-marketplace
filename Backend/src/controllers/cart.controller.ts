import { Request, Response } from "express";
import { Cart } from "../models/Cart";
import { asyncHandler } from "../utils/asyncHandler";
import { parseOrThrow } from "../utils/validate";
import { addCartItemSchema, updateCartItemSchema } from "../validators/cart.schema";

type PlainItem = { productId: string; quantity: number };

async function readCart(req: Request): Promise<PlainItem[]> {
  if (req.session.userId) {
    const cart = await Cart.findOne({ userId: req.session.userId });
    return cart ? (cart.toJSON() as unknown as { items: PlainItem[] }).items : [];
  }
  return req.session.guestCart ?? [];
}

async function writeCart(req: Request, items: PlainItem[]): Promise<void> {
  if (req.session.userId) {
    await Cart.findOneAndUpdate(
      { userId: req.session.userId },
      { $set: { items } },
      { upsert: true }
    );
    return;
  }
  req.session.guestCart = items;
}

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  res.json({ items: await readCart(req) });
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const { productId, quantity } = parseOrThrow(addCartItemSchema, req.body);
  const items = await readCart(req);
  const existing = items.find((i) => i.productId === productId);
  if (existing) existing.quantity += quantity;
  else items.push({ productId, quantity });
  await writeCart(req, items);
  res.json({ items });
});

export const updateQuantity = asyncHandler(async (req: Request, res: Response) => {
  const { quantity } = parseOrThrow(updateCartItemSchema, req.body);
  let items = await readCart(req);
  if (quantity <= 0) {
    items = items.filter((i) => i.productId !== req.params.productId);
  } else {
    const item = items.find((i) => i.productId === req.params.productId);
    if (item) item.quantity = quantity;
  }
  await writeCart(req, items);
  res.json({ items });
});

export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const items = (await readCart(req)).filter((i) => i.productId !== req.params.productId);
  await writeCart(req, items);
  res.json({ items });
});

export const clear = asyncHandler(async (req: Request, res: Response) => {
  await writeCart(req, []);
  res.status(204).end();
});
