import { Router } from "express";
import * as aiController from "../controllers/ai.controller";

const router = Router();

// Sem requireAuth — o chat é público (visitante pode buscar/comparar
// produtos); a ferramenta get_my_orders checa a sessão por conta própria.
router.post("/chat", aiController.chat);
router.post("/listing-assistant", aiController.listingAssistant);
router.get("/products/:productId/review-summary", aiController.reviewSummary);

export default router;
