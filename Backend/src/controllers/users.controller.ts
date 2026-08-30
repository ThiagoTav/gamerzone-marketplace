import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { FilterQuery } from "mongoose";
import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/HttpError";
import { parseOrThrow } from "../utils/validate";
import { changePasswordSchema, updateProfileSchema } from "../validators/user.schema";

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const { search } = req.query;
  const filter: FilterQuery<typeof User> = {};
  if (search) filter.name = new RegExp(String(search), "i");
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json(users);
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new HttpError(404, "Usuário não encontrado");
  res.json(user);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const data = parseOrThrow(updateProfileSchema, req.body);
  const update: Record<string, unknown> = {};

  if (data.name !== undefined) update.name = data.name;
  if (data.avatar !== undefined) update.avatar = data.avatar;
  if (data.email !== undefined) {
    const existing = await User.findOne({ email: data.email });
    if (existing && existing.id !== req.session.userId!) throw new HttpError(409, "E-mail já cadastrado");
    update.email = data.email;
  }

  const user = await User.findByIdAndUpdate(req.session.userId!, update, { new: true });
  if (!user) throw new HttpError(404, "Usuário não encontrado");
  res.json(user);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const data = parseOrThrow(changePasswordSchema, req.body);
  const user = await User.findById(req.session.userId!).select("+passwordHash");
  if (!user) throw new HttpError(404, "Usuário não encontrado");

  const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!valid) throw new HttpError(401, "Senha atual incorreta");

  user.passwordHash = await bcrypt.hash(data.newPassword, 10);
  await user.save();
  res.status(204).end();
});
