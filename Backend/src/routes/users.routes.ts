import { Router } from "express";
import * as usersController from "../controllers/users.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/", usersController.getAll);
router.put("/me", requireAuth, usersController.updateProfile);
router.put("/me/password", requireAuth, usersController.changePassword);
router.get("/:id", usersController.getUserById);

export default router;
