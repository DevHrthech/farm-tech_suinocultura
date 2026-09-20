import { Response } from "express";
import { CourseModel } from "../models/course.model";
import { AuthRequest } from "../middleware/auth.middleware";

export const CourseController = {
  list: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const courses = await CourseModel.findAll(tenantId);
    res.json(courses);
  },

  getById: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const courseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const course = await CourseModel.findById(courseId, tenantId);
    if (!course)
      return res.status(404).json({ error: "Curso não encontrado" });
    res.json(course);
  },

  create: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const { title, description, category, authorId, coverImageUrl } = req.body;
    const course = await CourseModel.create({
      tenantId,
      title,
      description,
      category,
      authorId,
      coverImageUrl,
    });
    res.status(201).json(course);
  },

  update: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const courseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updated = await CourseModel.update(courseId, tenantId, req.body);
    if (!updated)
      return res.status(404).json({ error: "Curso não encontrado" });
    res.json(updated);
  },

  remove: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const courseId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = await CourseModel.delete(courseId, tenantId);
    if (!deleted)
      return res.status(404).json({ error: "Curso não encontrado" });
    res.status(204).send();
  },
};
