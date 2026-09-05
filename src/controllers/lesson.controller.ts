import { Request, Response } from "express";
import { LessonModel } from "../models/lesson.model";

export const LessonController = {
  list: (req: Request, res: Response) => {
    const tenantId = req.headers["x-tenant-id"] as string;
    const { courseId } = req.params;
    const lessons = LessonModel.findByCourseId(courseId, tenantId);
    res.json(lessons);
  },

  getById: (req: Request, res: Response) => {
    const tenantId = req.headers["x-tenant-id"] as string;
    const lesson = LessonModel.findById(req.params.id, tenantId);
    if (!lesson)
      return res.status(404).json({ error: "Aula não encontrada" });
    res.json(lesson);
  },

  create: (req: Request, res: Response) => {
    const tenantId = req.headers["x-tenant-id"] as string;
    const { courseId } = req.params;
    const { title, description, videoId, order } = req.body;

    if (!videoId) {
      return res
        .status(400)
        .json({ error: "videoId é obrigatório" });
    }

    const lesson = LessonModel.create({
      courseId,
      tenantId,
      title,
      description,
      videoId,
      order: order ?? 0,
    });
    res.status(201).json(lesson);
  },

  update: (req: Request, res: Response) => {
    const tenantId = req.headers["x-tenant-id"] as string;
    const updated = LessonModel.update(req.params.id, tenantId, req.body);
    if (!updated)
      return res.status(404).json({ error: "Aula não encontrada" });
    res.json(updated);
  },

  remove: (req: Request, res: Response) => {
    const tenantId = req.headers["x-tenant-id"] as string;
    const deleted = LessonModel.delete(req.params.id, tenantId);
    if (!deleted)
      return res.status(404).json({ error: "Aula não encontrada" });
    res.status(204).send();
  },
};
