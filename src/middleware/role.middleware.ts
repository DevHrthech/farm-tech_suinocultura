import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { CourseModel } from "../models/course.model";

export const requireRole =
  (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Acesso negado" });
    }
    next();
  };

export const requireCourseOwnership =
  (paramName: string = "courseId") =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const tenantId = req.tenantId!;
    const courseId = Array.isArray(req.params[paramName])
      ? req.params[paramName][0]
      : req.params[paramName];

    const course = await CourseModel.findById(courseId, tenantId);
    if (!course) {
      return res.status(404).json({ error: "Curso não encontrado" });
    }

    if (req.user!.role !== "admin" && course.authorId !== req.user!.userId) {
      return res
        .status(403)
        .json({ error: "Você não tem permissão para gerenciar este curso" });
    }

    (req as any).course = course;
    next();
  };
