import bcrypt from "bcrypt";
import prisma from "../lib/prisma";

const PROJETO_ID = "5119fe85-1f7e-44d3-b50c-fbf97e64c33c";

export const UserModel = {
  findByEmail: async (email: string) => {
    return prisma.user.findUnique({ where: { email } });
  },

  findById: async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  },

  create: async (data: {
    nomeCompleto: string;
    email: string;
    role: string;
    tenantId: string;
  }) => {
    return prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        nomeCompleto: data.nomeCompleto,
        email: data.email,
        role: data.role,
        tenantId: data.tenantId,
        idProjeto: PROJETO_ID,
        passwordHash: "",
      },
    });
  },

  setPassword: async (userId: string, password: string) => {
    const passwordHash = await bcrypt.hash(password, 10);
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  },

  updateProfile: async (
    userId: string,
    data: { nomeCompleto?: string; avatarUrl?: string | null }
  ) => {
    return prisma.user.update({
      where: { id: userId },
      data,
    });
  },

  updateRole: async (userId: string, role: string) => {
    return prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  },

  list: async (tenantId: string) => {
    return prisma.user.findMany({
      where: { tenantId },
      orderBy: { nomeCompleto: "asc" },
    });
  },

  upsertByEmail: async (email: string, data: {
    nomeCompleto: string;
    role: string;
    tenantId: string;
    passwordHash: string;
  }) => {
    return prisma.user.upsert({
      where: { email },
      update: {
        passwordHash: data.passwordHash,
      },
      create: {
        id: crypto.randomUUID(),
        email,
        nomeCompleto: data.nomeCompleto,
        role: data.role,
        tenantId: data.tenantId,
        passwordHash: data.passwordHash,
        idProjeto: PROJETO_ID,
      },
    });
  },
};

export const seedUsers = async () => {
  // Primeiro, garantir que o Projeto existe
  await prisma.projeto.upsert({
    where: { idProjeto: PROJETO_ID },
    update: {},
    create: {
      idProjeto: PROJETO_ID,
      nomeProjeto: "LMS Suinocultura",
    },
  });

  const email = "gentilsilva007@gmail.com";
  const passwordHash = await bcrypt.hash("gentil1046", 10);

  const user = await UserModel.upsertByEmail(email, {
    nomeCompleto: "Gentil Coelho da Silva Neto",
    role: "admin",
    tenantId: "tenant-1",
    passwordHash,
  });

  console.log("✅ Seed user criado/atualizado com sucesso");

  return user;
};
