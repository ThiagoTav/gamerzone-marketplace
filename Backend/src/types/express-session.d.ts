import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    guestCart?: { productId: string; quantity: number }[];
  }
}
