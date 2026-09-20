import { Router } from "express";
import { CourseController } from "../controllers/course.controller";
import { requireRole, requireCourseOwnership } from "../middleware/role.middleware";

export const courseRoutes = Router();

courseRoutes.get("/", CourseController.list);
courseRoutes.get("/:id", CourseController.getById);
courseRoutes.post("/", requireRole("instrutor", "admin"), CourseController.create);
courseRoutes.put(
  "/:id",
  requireRole("instrutor", "admin"),
  requireCourseOwnership("id"),
  CourseController.update
);
courseRoutes.delete(
  "/:id",
  requireRole("instrutor", "admin"),
  requireCourseOwnership("id"),
  CourseController.remove
);
