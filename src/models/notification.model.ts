import prisma from "../lib/prisma";

const PROJETO_ID = "5119fe85-1f7e-44d3-b50c-fbf97e64c33c";

export const NotificationModel = {
  listForUser: (userId: string, take: number = 20) =>
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take,
    }),

  unreadCount: (userId: string) => prisma.notification.count({ where: { userId, read: false } }),

  markAllRead: (userId: string) =>
    prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } }),

  create: (data: { userId: string; tenantId: string; type: string; message: string; link?: string | null }) =>
    prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        userId: data.userId,
        tenantId: data.tenantId,
        idProjeto: PROJETO_ID,
        type: data.type,
        message: data.message,
        link: data.link ?? null,
      },
    }),

  createMany: (
    recipients: string[],
    data: { tenantId: string; type: string; message: string; link?: string | null }
  ) =>
    prisma.notification.createMany({
      data: recipients.map((userId) => ({
        id: crypto.randomUUID(),
        userId,
        tenantId: data.tenantId,
        idProjeto: PROJETO_ID,
        type: data.type,
        message: data.message,
        link: data.link ?? null,
      })),
    }),
};
