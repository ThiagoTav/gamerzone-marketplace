import { Router } from "express";
import * as uploadsController from "../controllers/uploads.controller";
import { requireAuth } from "../middleware/requireAuth";
import { upload } from "../middleware/upload";
import { uploadAvatar } from "../middleware/uploadAvatar";

const router = Router();

router.post("/", requireAuth, upload.array("images", 6), uploadsController.uploadImages);
router.post("/avatar", requireAuth, uploadAvatar.single("avatar"), uploadsController.uploadAvatarImage);

export default router;
