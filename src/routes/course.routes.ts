import { Router } from "express";
import { CourseController } from "../controllers/course.controller";

export const courseRoutes = Router();

courseRoutes.get("/", CourseController.list);
courseRoutes.get("/:id", CourseController.getById);
courseRoutes.post("/", CourseController.create);
courseRoutes.put("/:id", CourseController.update);
courseRoutes.delete("/:id", CourseController.remove);
