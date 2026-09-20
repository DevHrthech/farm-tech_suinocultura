import { Response } from "express";
import { UserModel } from "../models/user.model";
import { AuthRequest } from "../middleware/auth.middleware";
import { ROLES } from "../constants/roles";

export const UserController = {
  getById: async (req: AuthRequest, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    res.json({
      id: user.id,
      nomeCompleto: user.nomeCompleto,
      email: user.email,
      role: user.role,
    });
  },

  list: async (req: AuthRequest, res: Response) => {
    const tenantId = req.tenantId!;
    const users = await UserModel.list(tenantId);
    res.json(
      users.map((user) => ({
        id: user.id,
        nomeCompleto: user.nomeCompleto,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      }))
    );
  },

  updateRole: async (req: AuthRequest, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { role } = req.body;

    if (!ROLES.includes(role)) {
      return res.status(400).json({ error: "Papel inválido" });
    }

    const user = await UserModel.findById(id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const updated = await UserModel.updateRole(id, role);
    res.json({
      id: updated.id,
      nomeCompleto: updated.nomeCompleto,
      email: updated.email,
      role: updated.role,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
    });
  },
};
