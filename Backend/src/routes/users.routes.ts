import { Router } from "express";
import * as usersController from "../controllers/users.controller";

const router = Router();

router.get("/:id", usersController.getUserById);

export default router;
