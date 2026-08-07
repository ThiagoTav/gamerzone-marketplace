import { Router } from "express";
import * as ordersController from "../controllers/orders.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/", requireAuth, ordersController.createOrder);
router.get("/mine", requireAuth, ordersController.getMyOrders);

export default router;
