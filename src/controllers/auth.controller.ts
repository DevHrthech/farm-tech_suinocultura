import { Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserModel } from "../models/user.model";
import { AuthRequest } from "../middleware/auth.middleware";

export const AuthController = {
  login: async (req: AuthRequest, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email e senha são obrigatórios" });
    }

    const user = await UserModel.findByEmail(email);

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenantId,
        role: user.role,
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nomeCompleto: user.nomeCompleto,
        email: user.email,
        role: user.role,
      },
    });
  },

  register: async (req: AuthRequest, res: Response) => {
    try {
      const { nomeCompleto, email, password } = req.body;

      if (!email || !password || !nomeCompleto) {
        return res
          .status(400)
          .json({ error: "Nome completo, email e senha são obrigatórios" });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Email inválido" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres" });
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "Email já está em uso" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      console.log(`[AUTH DEBUG] Criando novo usuário: email=${email}, nomeCompleto=${nomeCompleto}`);
      const user = await UserModel.upsertByEmail(email, {
        nomeCompleto,
        role: "aluno",
        tenantId: "tenant-1",
        passwordHash,
      });
      console.log(`[AUTH DEBUG] Usuário criado com sucesso: id=${user.id}, email=${user.email}`);

      const token = jwt.sign(
        {
          userId: user.id,
          tenantId: user.tenantId,
          role: user.role,
        },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "24h" }
      );

      res.status(201).json({
        token,
        user: {
          id: user.id,
          nomeCompleto: user.nomeCompleto,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[AUTH ERROR] Erro no registro:", error);
      console.error("[AUTH ERROR] Stack trace:", (error as Error).stack);
      res.status(500).json({ error: "Erro ao criar conta. Tente novamente." });
    }
  },
};
