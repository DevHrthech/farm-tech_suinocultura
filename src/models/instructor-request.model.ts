import prisma from "../lib/prisma";

const PROJETO_ID = "5119fe85-1f7e-44d3-b50c-fbf97e64c33c";

export const InstructorRequestModel = {
  findByUserId: (userId: string) => prisma.instructorRequest.findUnique({ where: { userId } }),

  findById: (id: string) => prisma.instructorRequest.findUnique({ where: { id } }),

  list: (tenantId: string) =>
    prisma.instructorRequest.findMany({
      where: { tenantId },
      include: { user: { select: { id: true, nomeCompleto: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),

  submit: (userId: string, tenantId: string) =>
    prisma.instructorRequest.upsert({
      where: { userId },
      update: { status: "pending", reviewedBy: null, reviewedAt: null },
      create: {
        id: crypto.randomUUID(),
        userId,
        tenantId,
        idProjeto: PROJETO_ID,
        status: "pending",
      },
    }),

  review: (id: string, status: "approved" | "rejected", reviewedBy: string) =>
    prisma.instructorRequest.update({
      where: { id },
      data: { status, reviewedBy, reviewedAt: new Date() },
    }),
};
