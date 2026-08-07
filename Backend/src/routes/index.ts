import { Router } from "express";
import authRoutes from "./auth.routes";
import usersRoutes from "./users.routes";
import productsRoutes from "./products.routes";
import cartRoutes from "./cart.routes";
import ordersRoutes from "./orders.routes";
import uploadsRoutes from "./uploads.routes";

const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true }));
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/products", productsRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", ordersRoutes);
router.use("/uploads", uploadsRoutes);

export default router;
