import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/HttpError";

export const uploadImages = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) ?? [];
  if (files.length === 0) throw new HttpError(400, "Nenhuma imagem enviada");
  const urls = files.map((f) => `/uploads/products/${f.filename}`);
  res.status(201).json({ urls });
});
