export type ProductCondition = "new" | "used";
export type ProductStatus = "active" | "paused" | "sold";

export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  condition: ProductCondition;
  status: ProductStatus;
  images: string[];
  specs: Record<string, string>;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export const CATEGORIES = ["Teclados", "Mouses", "Headsets", "Monitores", "Cadeiras", "Acessórios"];
