import { Response } from "express";
import { LessonModel } from "../models/lesson.model";
import { AuthRequest } from "../middleware/auth.middleware";

export const LessonController = {
  list: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const courseId = Array.isArray(req.params.courseId)
      ? req.params.courseId[0]
      : (req.params.courseId as string);
    const lessons = await LessonModel.findByCourseId(courseId, tenantId);
    res.json(lessons);
  },

  getById: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const lessonId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    const lesson = await LessonModel.findById(lessonId, tenantId);
    if (!lesson)
      return res.status(404).json({ error: "Aula não encontrada" });
    res.json(lesson);
  },

  create: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const courseId = Array.isArray(req.params.courseId)
      ? req.params.courseId[0]
      : (req.params.courseId as string);
    const { title, description, videoId, order } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: "videoId é obrigatório" });
    }

    const lesson = await LessonModel.create({
      courseId,
      tenantId,
      title,
      description,
      videoId,
      order: order ?? 0,
    });
    res.status(201).json(lesson);
  },

  update: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const lessonId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    const updated = await LessonModel.update(lessonId, tenantId, req.body);
    if (!updated)
      return res.status(404).json({ error: "Aula não encontrada" });
    res.json(updated);
  },

  remove: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const lessonId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    const deleted = await LessonModel.delete(lessonId, tenantId);
    if (!deleted)
      return res.status(404).json({ error: "Aula não encontrada" });
    res.status(204).send();
  },
};
