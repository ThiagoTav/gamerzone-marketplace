import { Router } from "express";
import * as cartController from "../controllers/cart.controller";

const router = Router();

router.get("/", cartController.getCart);
router.post("/items", cartController.addItem);
router.patch("/items/:productId", cartController.updateQuantity);
router.delete("/items/:productId", cartController.removeItem);
router.delete("/", cartController.clear);

export default router;
