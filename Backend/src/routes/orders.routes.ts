import { Router } from "express";
import * as ordersController from "../controllers/orders.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/", requireAuth, ordersController.createOrder);
router.get("/mine", requireAuth, ordersController.getMyOrders);
router.get("/sales", requireAuth, ordersController.getSales);
router.patch("/:orderId/items/:productId/status", requireAuth, ordersController.updateItemStatus);

export default router;
