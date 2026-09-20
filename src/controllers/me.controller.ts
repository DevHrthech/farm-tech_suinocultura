import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const MeController = {
  dashboard: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const userId = req.user!.userId;

    const courses = await prisma.course.findMany({
      where: { tenantId },
      include: { lessons: { select: { id: true } } },
      orderBy: { createdAt: "asc" },
    });

    const completedRows = await prisma.lessonProgress.findMany({
      where: { userId, completed: true },
      select: { lessonId: true },
    });
    const completedSet = new Set(completedRows.map((row) => row.lessonId));

    const coursesProgress = courses.map((course) => {
      const total = course.lessons.length;
      const completed = course.lessons.filter((lesson) => completedSet.has(lesson.id)).length;
      return {
        courseId: course.id,
        courseTitle: course.title,
        category: course.category,
        coverImageUrl: course.coverImageUrl,
        totalLessons: total,
        completedLessons: completed,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });

    const lastProgress = await prisma.lessonProgress.findFirst({
      where: { userId, completed: true },
      orderBy: { watchedAt: "desc" },
      include: { lesson: { include: { course: true } } },
    });

    const lastLesson = lastProgress
      ? {
          lessonId: lastProgress.lesson.id,
          lessonTitle: lastProgress.lesson.title,
          courseId: lastProgress.lesson.course.id,
          courseTitle: lastProgress.lesson.course.title,
          watchedAt: lastProgress.watchedAt,
        }
      : null;

    const recentLessons = await prisma.lessonProgress.findMany({
      where: { userId, completed: true },
      orderBy: { watchedAt: "desc" },
      take: 8,
      include: { lesson: { include: { course: true } } },
    });

    const recentAttempts = await prisma.quizAttempt.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
      take: 8,
      include: { course: true },
    });

    const activity = [
      ...recentLessons.map((progress) => ({
        type: "lesson" as const,
        at: progress.watchedAt,
        courseId: progress.lesson.courseId,
        courseTitle: progress.lesson.course.title,
        lessonTitle: progress.lesson.title,
      })),
      ...recentAttempts.map((attempt) => ({
        type: "quiz" as const,
        at: attempt.completedAt,
        courseId: attempt.courseId,
        courseTitle: attempt.course.title,
        score: attempt.score,
        total: attempt.total,
      })),
    ]
      .sort((a, b) => new Date(b.at as Date).getTime() - new Date(a.at as Date).getTime())
      .slice(0, 8);

    const allAttempts = await prisma.quizAttempt.findMany({
      where: { userId },
      select: { score: true, total: true },
    });

    const totalLessons = coursesProgress.reduce((sum, course) => sum + course.totalLessons, 0);
    const totalCompleted = coursesProgress.reduce((sum, course) => sum + course.completedLessons, 0);
    const coursesStarted = coursesProgress.filter((course) => course.completedLessons > 0).length;
    const coursesCompleted = coursesProgress.filter(
      (course) => course.totalLessons > 0 && course.completedLessons === course.totalLessons
    ).length;
    const avgQuizScore =
      allAttempts.length > 0
        ? Math.round(
            allAttempts.reduce((sum, attempt) => sum + (attempt.total ? attempt.score / attempt.total : 0), 0) /
              allAttempts.length *
              100
          )
        : null;

    res.json({
      coursesProgress,
      lastLesson,
      activity,
      stats: {
        totalCourses: courses.length,
        coursesStarted,
        coursesCompleted,
        totalLessons,
        totalCompleted,
        quizzesTaken: allAttempts.length,
        avgQuizScore,
      },
    });
  },
};
