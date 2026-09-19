import { Response } from "express";
import { LessonModel } from "../models/lesson.model";
import { LessonProgressModel } from "../models/lessonProgress.model";
import { AuthRequest } from "../middleware/auth.middleware";

const toLessonDto = (lesson: any, completed = false) => {
  const { lessonOrder, ...rest } = lesson;
  return { ...rest, order: lessonOrder, completed };
};

export const LessonController = {
  list: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const userId = req.user!.userId;
    const courseId = Array.isArray(req.params.courseId)
      ? req.params.courseId[0]
      : (req.params.courseId as string);
    const lessons = await LessonModel.findByCourseId(courseId, tenantId);
    const completedIds = await LessonProgressModel.findCompletedLessonIds(
      userId,
      lessons.map((lesson) => lesson.id)
    );
    res.json(lessons.map((lesson) => toLessonDto(lesson, completedIds.has(lesson.id))));
  },

  getById: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const userId = req.user!.userId;
    const lessonId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    const lesson = await LessonModel.findById(lessonId, tenantId);
    if (!lesson)
      return res.status(404).json({ error: "Aula não encontrada" });
    const completedIds = await LessonProgressModel.findCompletedLessonIds(userId, [lesson.id]);
    res.json(toLessonDto(lesson, completedIds.has(lesson.id)));
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
    res.status(201).json(toLessonDto(lesson));
  },

  update: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const lessonId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    const updated = await LessonModel.update(lessonId, tenantId, req.body);
    if (!updated)
      return res.status(404).json({ error: "Aula não encontrada" });
    res.json(toLessonDto(updated));
  },

  remove: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const lessonId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    const deleted = await LessonModel.delete(lessonId, tenantId);
    if (!deleted)
      return res.status(404).json({ error: "Aula não encontrada" });
    res.status(204).send();
  },

  complete: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const userId = req.user!.userId;
    const lessonId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);

    const lesson = await LessonModel.findById(lessonId, tenantId);
    if (!lesson)
      return res.status(404).json({ error: "Aula não encontrada" });

    await LessonProgressModel.markComplete(userId, lessonId, tenantId);
    res.json(toLessonDto(lesson, true));
  },

  uncomplete: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const userId = req.user!.userId;
    const lessonId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);

    const lesson = await LessonModel.findById(lessonId, tenantId);
    if (!lesson)
      return res.status(404).json({ error: "Aula não encontrada" });

    await LessonProgressModel.markIncomplete(userId, lessonId);
    res.json(toLessonDto(lesson, false));
  },
};
