import { Router } from "express";
import { LessonController } from "../controllers/lesson.controller";
import { requireRole, requireCourseOwnership } from "../middleware/role.middleware";

export const lessonRoutes = Router({ mergeParams: true });

lessonRoutes.get("/", LessonController.list);
lessonRoutes.get("/:id", LessonController.getById);
lessonRoutes.post("/", requireRole("instrutor", "admin"), requireCourseOwnership(), LessonController.create);
lessonRoutes.put("/:id", requireRole("instrutor", "admin"), requireCourseOwnership(), LessonController.update);
lessonRoutes.delete("/:id", requireRole("instrutor", "admin"), requireCourseOwnership(), LessonController.remove);
lessonRoutes.post("/:id/complete", LessonController.complete);
lessonRoutes.delete("/:id/complete", LessonController.uncomplete);
