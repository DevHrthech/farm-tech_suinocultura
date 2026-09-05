import { Router } from "express";
import { LessonController } from "../controllers/lesson.controller";

export const lessonRoutes = Router({ mergeParams: true });

lessonRoutes.get("/", LessonController.list);
lessonRoutes.get("/:id", LessonController.getById);
lessonRoutes.post("/", LessonController.create);
lessonRoutes.put("/:id", LessonController.update);
lessonRoutes.delete("/:id", LessonController.remove);
