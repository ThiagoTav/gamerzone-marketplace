import { FilterQuery } from "mongoose";
import { Product } from "../models/Product";

// Reaproveitado tanto pelo GET /products normal (req.query, tudo string)
// quanto pela tool search_products do agente de IA (args já tipados) —
// por isso minPrice/maxPrice aceitam string ou number.
export interface ProductFilterParams {
  search?: string;
  category?: string;
  condition?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
}

export function buildProductFilter(params: ProductFilterParams): FilterQuery<typeof Product> {
  const { search, category, condition, minPrice, maxPrice } = params;

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

  return filter;
}
