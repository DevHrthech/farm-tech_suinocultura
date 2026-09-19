import prisma from "../lib/prisma";

export const LessonProgressModel = {
  findCompletedLessonIds: async (userId: string, lessonIds: string[]): Promise<Set<string>> => {
    if (lessonIds.length === 0) return new Set();
    const rows = await prisma.lessonProgress.findMany({
      where: { userId, lessonId: { in: lessonIds }, completed: true },
      select: { lessonId: true },
    });
    return new Set(rows.map((row) => row.lessonId));
  },

  markComplete: (userId: string, lessonId: string, tenantId: string) =>
    prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completed: true, watchedAt: new Date() },
      create: {
        userId,
        lessonId,
        tenantId,
        completed: true,
        watchedAt: new Date(),
      },
    }),

  markIncomplete: (userId: string, lessonId: string) =>
    prisma.lessonProgress.updateMany({
      where: { userId, lessonId },
      data: { completed: false },
    }),
};
