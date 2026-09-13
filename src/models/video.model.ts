import prisma from "../lib/prisma";

const PROJETO_ID = "5119fe85-1f7e-44d3-b50c-fbf97e64c33c";

export const VideoModel = {
  findByCourseId: (courseId: string, tenantId: string) =>
    prisma.lesson.findMany({
      where: { courseId, tenantId },
    }),

  findById: (id: string, tenantId: string) =>
    prisma.lesson.findFirst({ where: { id, tenantId } }),

  findAll: (tenantId: string) =>
    prisma.lesson.findMany({ where: { tenantId } }),
};
