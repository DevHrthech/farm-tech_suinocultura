import { Router } from "express";
import { InstructorRequestController } from "../controllers/instructor-request.controller";
import { requireRole } from "../middleware/role.middleware";

export const instructorRequestRoutes = Router();

instructorRequestRoutes.get("/me", InstructorRequestController.mine);
instructorRequestRoutes.get("/", requireRole("admin"), InstructorRequestController.list);
instructorRequestRoutes.post("/", requireRole("aluno"), InstructorRequestController.create);
instructorRequestRoutes.put("/:id/approve", requireRole("admin"), InstructorRequestController.approve);
instructorRequestRoutes.put("/:id/reject", requireRole("admin"), InstructorRequestController.reject);
