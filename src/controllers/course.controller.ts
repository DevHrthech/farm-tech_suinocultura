import { Request, Response } from "express";
import { CourseModel } from "../models/course.model";

export const CourseController = {
  list: (req: Request, res: Response) => {
    const tenantId = req.headers["x-tenant-id"] as string;
    res.json(CourseModel.findAll(tenantId));
  },

  getById: (req: Request, res: Response) => {
    const tenantId = req.headers["x-tenant-id"] as string;
    const course = CourseModel.findById(req.params.id, tenantId);
    if (!course)
      return res.status(404).json({ error: "Curso não encontrado" });
    res.json(course);
  },

  create: (req: Request, res: Response) => {
    const tenantId = req.headers["x-tenant-id"] as string;
    const { title, description, category, authorId } = req.body;
    const course = CourseModel.create({
      tenantId,
      title,
      description,
      category,
      authorId,
    });
    res.status(201).json(course);
  },

  update: (req: Request, res: Response) => {
    const tenantId = req.headers["x-tenant-id"] as string;
    const updated = CourseModel.update(req.params.id, tenantId, req.body);
    if (!updated)
      return res.status(404).json({ error: "Curso não encontrado" });
    res.json(updated);
  },

  remove: (req: Request, res: Response) => {
    const tenantId = req.headers["x-tenant-id"] as string;
    const deleted = CourseModel.delete(req.params.id, tenantId);
    if (!deleted)
      return res.status(404).json({ error: "Curso não encontrado" });
    res.status(204).send();
  },
};
