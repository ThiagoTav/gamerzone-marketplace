import { Router } from "express";
import * as productsController from "../controllers/products.controller";
import * as reviewsController from "../controllers/reviews.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/mine", requireAuth, productsController.getMine);
router.get("/seller/:sellerId", productsController.getBySeller);
router.get("/", productsController.getAll);
router.post("/", requireAuth, productsController.create);

router.get("/:id", productsController.getById);
router.put("/:id", requireAuth, productsController.update);
router.delete("/:id", requireAuth, productsController.remove);
router.patch("/:id/status", requireAuth, productsController.setStatus);

router.get("/:productId/reviews", reviewsController.getByProduct);
router.post("/:productId/reviews", requireAuth, reviewsController.create);

export default router;
