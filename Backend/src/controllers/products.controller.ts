import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { Product } from "../models/Product";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/HttpError";
import { parseOrThrow } from "../utils/validate";
import { productSchema, productStatusSchema, productUpdateSchema } from "../validators/product.schema";

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const { search, category, condition, minPrice, maxPrice } = req.query;

  const filter: FilterQuery<typeof Product> = { status: "active" };
  if (search) {
    const regex = new RegExp(String(search), "i");
    filter.$or = [{ title: regex }, { category: regex }];
  }
  if (category) filter.category = String(category);
  if (condition) filter.condition = String(condition);
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

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
