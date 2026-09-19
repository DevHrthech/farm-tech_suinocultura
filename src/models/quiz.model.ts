import prisma from "../lib/prisma";

const PROJETO_ID = "5119fe85-1f7e-44d3-b50c-fbf97e64c33c";

export const QuizModel = {
  findQuestionsByCourseId: (courseId: string, tenantId: string) =>
    prisma.quizQuestion.findMany({
      where: { courseId, tenantId },
      orderBy: { questionOrder: "asc" },
    }),

  findQuestionById: (id: string, tenantId: string) =>
    prisma.quizQuestion.findFirst({ where: { id, tenantId } }),

  createQuestion: (data: {
    courseId: string;
    tenantId: string;
    text: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
    order: number;
  }) =>
    prisma.quizQuestion.create({
      data: {
        courseId: data.courseId,
        tenantId: data.tenantId,
        text: data.text,
        options: data.options,
        correctIndex: data.correctIndex,
        explanation: data.explanation,
        questionOrder: data.order,
        idProjeto: PROJETO_ID,
      },
    }),

  updateQuestion: (id: string, tenantId: string, data: Partial<any>) => {
    const updateData: any = {};
    if (data.text !== undefined) updateData.text = data.text;
    if (data.options !== undefined) updateData.options = data.options;
    if (data.correctIndex !== undefined) updateData.correctIndex = data.correctIndex;
    if (data.explanation !== undefined) updateData.explanation = data.explanation;
    if (data.order !== undefined) updateData.questionOrder = data.order;

    return prisma.quizQuestion
      .updateMany({ where: { id, tenantId }, data: updateData })
      .then((result) => {
        if (result.count === 0) return null;
        return prisma.quizQuestion.findFirst({ where: { id, tenantId } });
      });
  },

  deleteQuestion: (id: string, tenantId: string) =>
    prisma.quizQuestion.deleteMany({ where: { id, tenantId } }).then((r) => r.count > 0),

  createAttempt: (data: {
    userId: string;
    courseId: string;
    tenantId: string;
    score: number;
    total: number;
  }) =>
    prisma.quizAttempt.create({
      data: {
        userId: data.userId,
        courseId: data.courseId,
        tenantId: data.tenantId,
        score: data.score,
        total: data.total,
        idProjeto: PROJETO_ID,
      },
    }),

  findLastAttempt: (userId: string, courseId: string) =>
    prisma.quizAttempt.findFirst({
      where: { userId, courseId },
      orderBy: { completedAt: "desc" },
    }),
};
