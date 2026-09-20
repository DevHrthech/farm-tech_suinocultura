import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { InstructorRequestModel } from "../models/instructor-request.model";
import { NotificationModel } from "../models/notification.model";
import { UserModel } from "../models/user.model";
import prisma from "../lib/prisma";

export const InstructorRequestController = {
  mine: async (req: AuthRequest, res: Response) => {
    const request = await InstructorRequestModel.findByUserId(req.user!.userId);
    res.json(request ?? null);
  },

  list: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const requests = await InstructorRequestModel.list(tenantId);
    res.json(requests);
  },

  create: async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const tenantId = req.tenantId!;

    const existing = await InstructorRequestModel.findByUserId(userId);
    if (existing?.status === "pending") {
      return res.status(409).json({ error: "Você já tem uma solicitação em análise" });
    }

    const request = await InstructorRequestModel.submit(userId, tenantId);

    const requester = await UserModel.findById(userId);
    const admins = await prisma.user.findMany({
      where: { tenantId, role: "admin" },
      select: { id: true },
    });

    if (admins.length > 0) {
      await NotificationModel.createMany(
        admins.map((admin) => admin.id),
        {
          tenantId,
          type: "instructor_request_created",
          message: `${requester?.nomeCompleto ?? "Um aluno"} quer se tornar instrutor.`,
          link: "/admin/users?tab=requests",
        }
      );
    }

    res.status(201).json(request);
  },

  approve: async (req: AuthRequest, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const tenantId = req.tenantId!;

    const request = await InstructorRequestModel.findById(id);
    if (!request) return res.status(404).json({ error: "Solicitação não encontrada" });

    const updated = await InstructorRequestModel.review(id, "approved", req.user!.userId);
    await UserModel.updateRole(request.userId, "instrutor");
    await NotificationModel.create({
      userId: request.userId,
      tenantId,
      type: "instructor_request_approved",
      message: "Sua solicitação para se tornar instrutor foi aprovada! Você já pode criar cursos e quizzes.",
    });

    res.json(updated);
  },

  reject: async (req: AuthRequest, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const tenantId = req.tenantId!;

    const request = await InstructorRequestModel.findById(id);
    if (!request) return res.status(404).json({ error: "Solicitação não encontrada" });

    const updated = await InstructorRequestModel.review(id, "rejected", req.user!.userId);
    await NotificationModel.create({
      userId: request.userId,
      tenantId,
      type: "instructor_request_rejected",
      message: "Sua solicitação para se tornar instrutor foi recusada.",
    });

    res.json(updated);
  },
};
