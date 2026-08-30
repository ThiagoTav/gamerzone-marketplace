import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/HttpError";

export const uploadImages = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) ?? [];
  if (files.length === 0) throw new HttpError(400, "Nenhuma imagem enviada");
  const urls = files.map((f) => `/uploads/products/${f.filename}`);
  res.status(201).json({ urls });
});

export const uploadAvatarImage = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file as Express.Multer.File | undefined;
  if (!file) throw new HttpError(400, "Nenhuma imagem enviada");
  res.status(201).json({ url: `/uploads/avatars/${file.filename}` });
});
