import { Response } from "express";
import { UserModel } from "../models/user.model";
import { AuthRequest } from "../middleware/auth.middleware";

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
};
