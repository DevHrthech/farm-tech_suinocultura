import { Response } from "express";
import { QuizModel } from "../models/quiz.model";
import { AuthRequest } from "../middleware/auth.middleware";

const getCourseId = (req: AuthRequest) =>
  Array.isArray(req.params.courseId) ? req.params.courseId[0] : (req.params.courseId as string);

const getQuizId = (req: AuthRequest) =>
  Array.isArray(req.params.quizId) ? req.params.quizId[0] : (req.params.quizId as string);

const getId = (req: AuthRequest) =>
  Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);

const toQuizDto = (quiz: any) => {
  const { _count, ...rest } = quiz;
  return { ...rest, questionCount: _count?.questions ?? 0 };
};

const toQuestionDto = (question: any) => {
  const { questionOrder, ...rest } = question;
  return { ...rest, order: questionOrder };
};

export const QuizController = {
  listQuizzes: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const courseId = getCourseId(req);
    const quizzes = await QuizModel.findQuizzesByCourseId(courseId, tenantId);
    res.json(quizzes.map(toQuizDto));
  },

  summary: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const courseId = getCourseId(req);
    const quizzes = await QuizModel.findQuizzesByCourseId(courseId, tenantId);
    const quizCount = quizzes.length;
    const questionCount = quizzes.reduce((sum: number, quiz: any) => sum + (quiz._count?.questions ?? 0), 0);
    res.json({ quizCount, questionCount });
  },

  getQuiz: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const quizId = getQuizId(req);
    const quiz = await QuizModel.findQuizById(quizId, tenantId);
    if (!quiz) return res.status(404).json({ error: "Quiz não encontrado" });
    res.json(toQuizDto(quiz));
  },

  createQuiz: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const courseId = getCourseId(req);
    const { title, description } = req.body;

    if (!title || String(title).trim().length < 3) {
      return res.status(400).json({ error: "Título do quiz é obrigatório (mín. 3 caracteres)" });
    }

    const quiz = await QuizModel.createQuiz({ courseId, tenantId, title, description });
    res.status(201).json(toQuizDto({ ...quiz, _count: { questions: 0 } }));
  },

  updateQuiz: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const quizId = getQuizId(req);
    const { title, description } = req.body;
    const updated = await QuizModel.updateQuiz(quizId, tenantId, { title, description });
    if (!updated) return res.status(404).json({ error: "Quiz não encontrado" });
    res.json(toQuizDto(updated));
  },

  removeQuiz: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const quizId = getQuizId(req);
    const deleted = await QuizModel.deleteQuiz(quizId, tenantId);
    if (!deleted) return res.status(404).json({ error: "Quiz não encontrado" });
    res.status(204).send();
  },

  listQuestions: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const quizId = getQuizId(req);
    const questions = await QuizModel.findQuestionsByQuizId(quizId, tenantId);
    res.json(questions.map(toQuestionDto));
  },

  createQuestion: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const courseId = getCourseId(req);
    const quizId = getQuizId(req);
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
      quizId,
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
    const id = getId(req);
    const updated = await QuizModel.updateQuestion(id, tenantId, req.body);
    if (!updated) return res.status(404).json({ error: "Pergunta não encontrada" });
    res.json(toQuestionDto(updated));
  },

  removeQuestion: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const id = getId(req);
    const deleted = await QuizModel.deleteQuestion(id, tenantId);
    if (!deleted) return res.status(404).json({ error: "Pergunta não encontrada" });
    res.status(204).send();
  },

  createAttempt: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const userId = req.user!.userId;
    const courseId = getCourseId(req);
    const quizId = getQuizId(req);
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

    const attempt = await QuizModel.createAttempt({ userId, courseId, quizId, tenantId, score, total });
    res.status(201).json(attempt);
  },

  getLastAttempt: async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const quizId = getQuizId(req);
    const attempt = await QuizModel.findLastAttemptForQuiz(userId, quizId);
    res.json(attempt ?? null);
  },
};
