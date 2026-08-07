import { Router } from "express";
import * as uploadsController from "../controllers/uploads.controller";
import { requireAuth } from "../middleware/requireAuth";
import { upload } from "../middleware/upload";

const router = Router();

router.post("/", requireAuth, upload.array("images", 6), uploadsController.uploadImages);

export default router;
