import prisma from "../lib/prisma";

const PROJETO_ID = "5119fe85-1f7e-44d3-b50c-fbf97e64c33c";

export const LessonModel = {
  findByCourseId: (courseId: string, tenantId: string) =>
    prisma.lesson.findMany({
      where: { courseId, tenantId },
      orderBy: { lessonOrder: "asc" },
    }),

  findById: (id: string, tenantId: string) =>
    prisma.lesson.findFirst({ where: { id, tenantId } }),

  create: (data: {
    courseId: string;
    tenantId: string;
    title: string;
    description: string;
    videoId: string;
    order: number;
  }) => {
    return prisma.lesson.create({
      data: {
        id: crypto.randomUUID(),
        courseId: data.courseId,
        tenantId: data.tenantId,
        title: data.title,
        description: data.description,
        videoId: data.videoId,
        lessonOrder: data.order,
        idProjeto: PROJETO_ID,
      },
    });
  },

  update: (id: string, tenantId: string, data: Partial<any>) => {
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.videoId) updateData.videoId = data.videoId;
    if (data.order !== undefined) updateData.lessonOrder = data.order;

    return prisma.lesson.updateMany({
      where: { id, tenantId },
      data: updateData,
    }).then((result) => {
      if (result.count === 0) return null;
      return prisma.lesson.findFirst({ where: { id, tenantId } });
    });
  },

  delete: (id: string, tenantId: string) => {
    return prisma.lesson.deleteMany({
      where: { id, tenantId },
    }).then((result) => result.count > 0);
  },
};
