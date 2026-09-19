import { Response } from "express";
import { QuizModel } from "../models/quiz.model";
import { AuthRequest } from "../middleware/auth.middleware";

const toQuestionDto = (question: any) => {
  const { questionOrder, ...rest } = question;
  return { ...rest, order: questionOrder };
};

export const QuizController = {
  listQuestions: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const courseId = Array.isArray(req.params.courseId)
      ? req.params.courseId[0]
      : (req.params.courseId as string);
    const questions = await QuizModel.findQuestionsByCourseId(courseId, tenantId);
    res.json(questions.map(toQuestionDto));
  },

  createQuestion: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const courseId = Array.isArray(req.params.courseId)
      ? req.params.courseId[0]
      : (req.params.courseId as string);
    const { text, options, correctIndex, explanation, order } = req.body;

    if (!text || !Array.isArray(options) || options.length < 2) {
      return res
        .status(400)
        .json({ error: "Pergunta e ao menos 2 alternativas são obrigatórias" });
    }

    if (
      correctIndex === undefined ||
      correctIndex === null ||
      correctIndex < 0 ||
      correctIndex >= options.length
    ) {
      return res.status(400).json({ error: "Alternativa correta inválida" });
    }

    const question = await QuizModel.createQuestion({
      courseId,
      tenantId,
      text,
      options,
      correctIndex,
      explanation,
      order: order ?? 0,
    });
    res.status(201).json(toQuestionDto(question));
  },

  updateQuestion: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    const updated = await QuizModel.updateQuestion(id, tenantId, req.body);
    if (!updated) return res.status(404).json({ error: "Pergunta não encontrada" });
    res.json(toQuestionDto(updated));
  },

  removeQuestion: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    const deleted = await QuizModel.deleteQuestion(id, tenantId);
    if (!deleted) return res.status(404).json({ error: "Pergunta não encontrada" });
    res.status(204).send();
  },

  createAttempt: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const userId = req.user!.userId;
    const courseId = Array.isArray(req.params.courseId)
      ? req.params.courseId[0]
      : (req.params.courseId as string);
    const { score, total } = req.body;

    if (
      typeof score !== "number" ||
      typeof total !== "number" ||
      total <= 0 ||
      score < 0 ||
      score > total
    ) {
      return res.status(400).json({ error: "Pontuação inválida" });
    }

    const attempt = await QuizModel.createAttempt({ userId, courseId, tenantId, score, total });
    res.status(201).json(attempt);
  },

  getLastAttempt: async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const courseId = Array.isArray(req.params.courseId)
      ? req.params.courseId[0]
      : (req.params.courseId as string);
    const attempt = await QuizModel.findLastAttempt(userId, courseId);
    res.json(attempt ?? null);
  },
};
