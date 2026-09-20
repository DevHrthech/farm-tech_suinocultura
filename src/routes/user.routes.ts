import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { requireRole } from "../middleware/role.middleware";

export const userRoutes = Router();

userRoutes.get("/", requireRole("admin"), UserController.list);
userRoutes.get("/:id", UserController.getById);
userRoutes.put("/:id/role", requireRole("admin"), UserController.updateRole);
