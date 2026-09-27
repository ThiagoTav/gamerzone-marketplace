import { Request, Response } from "express";
import { Product } from "../models/Product";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/HttpError";
import { parseOrThrow } from "../utils/validate";
import { productSchema, productStatusSchema, productUpdateSchema } from "../validators/product.schema";
import { buildProductFilter } from "../services/productFilter";

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const filter = buildProductFilter(req.query as Record<string, string>);
  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
});

export const getMine = asyncHandler(async (req: Request, res: Response) => {
  const products = await Product.find({ sellerId: req.session.userId }).sort({ createdAt: -1 });
  res.json(products);
});

export const getBySeller = asyncHandler(async (req: Request, res: Response) => {
  const products = await Product.find({ sellerId: req.params.sellerId, status: "active" }).sort({
    createdAt: -1,
  });
  res.json(products);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new HttpError(404, "Produto não encontrado");
  res.json(product);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = parseOrThrow(productSchema, req.body);
  const product = await Product.create({ ...data, sellerId: req.session.userId, status: "active" });
  res.status(201).json(product);
});

async function loadOwnedProduct(id: string, userId: string) {
  const product = await Product.findById(id);
  if (!product) throw new HttpError(404, "Produto não encontrado");
  if (product.sellerId.toString() !== userId) throw new HttpError(403, "Você não é o dono deste anúncio");
  return product;
}

export const update = asyncHandler(async (req: Request, res: Response) => {
  const data = parseOrThrow(productUpdateSchema, req.body);
  const product = await loadOwnedProduct(req.params.id, req.session.userId!);
  Object.assign(product, data);
  await product.save();
  res.json(product);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const product = await loadOwnedProduct(req.params.id, req.session.userId!);
  await product.deleteOne();
  res.status(204).end();
});

export const setStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = parseOrThrow(productStatusSchema, req.body);
  const product = await loadOwnedProduct(req.params.id, req.session.userId!);
  product.status = status;
  await product.save();
  res.json(product);
});
