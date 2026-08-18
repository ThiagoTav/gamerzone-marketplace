import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Cart } from "../models/Cart";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/HttpError";
import { parseOrThrow } from "../utils/validate";
import { checkEmailSchema, loginSchema, registerSchema } from "../validators/auth.schema";

async function mergeGuestCartIntoUser(req: Request, userId: string) {
  const guestItems = req.session.guestCart ?? [];
  if (guestItems.length === 0) return;

  let cart = await Cart.findOne({ userId });
  if (!cart) cart = new Cart({ userId, items: [] });

  for (const guestItem of guestItems) {
    const existing = cart.items.find((i) => i.productId.toString() === guestItem.productId);
    if (existing) existing.quantity += guestItem.quantity;
    else cart.items.push({ productId: guestItem.productId as unknown as never, quantity: guestItem.quantity });
  }

  await cart.save();
  req.session.guestCart = undefined;
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = parseOrThrow(registerSchema, req.body);

  const existing = await User.findOne({ email: data.email });
  if (existing) throw new HttpError(409, "E-mail já cadastrado");

  const passwordHash = await bcrypt.hash(data.password, 10);
  const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.email)}`;

  const user = await User.create({ name: data.name, email: data.email, passwordHash, avatar });

  req.session.userId = user.id;
  await mergeGuestCartIntoUser(req, user.id);

  res.status(201).json({ user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = parseOrThrow(loginSchema, req.body);

  const user = await User.findOne({ email: data.email }).select("+passwordHash");
  if (!user) throw new HttpError(401, "E-mail ou senha inválidos");

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) throw new HttpError(401, "E-mail ou senha inválidos");

  req.session.userId = user.id;
  await mergeGuestCartIntoUser(req, user.id);

  res.json({ user });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.clearCookie("grz.sid");
    res.status(204).end();
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.session.userId) {
    res.json({ user: null });
    return;
  }
  const user = await User.findById(req.session.userId);
  res.json({ user: user ?? null });
});

export const checkEmail = asyncHandler(async (req: Request, res: Response) => {
  const result = checkEmailSchema.safeParse(req.query);
  if (!result.success) {
    res.json({ available: false });
    return;
  }
  const existing = await User.findOne({ email: result.data.email });
  res.json({ available: !existing });
});
