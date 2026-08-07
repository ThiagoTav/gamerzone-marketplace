// Mirrors CATEGORIES in src/mocks/products.ts on the frontend — keep in sync.
export const CATEGORIES = ["Teclados", "Mouses", "Headsets", "Monitores", "Cadeiras", "Acessórios"] as const;

export type Category = (typeof CATEGORIES)[number];
