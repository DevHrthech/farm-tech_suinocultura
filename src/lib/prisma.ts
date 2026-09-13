import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  const dbUrl = process.env.DATABASE_URL;
  console.log(`[PRISMA DEBUG] DATABASE_URL primeiros 30 caracteres: ${dbUrl?.substring(0, 30)}...`);
  console.log(`[PRISMA DEBUG] DATABASE_URL completa: ${dbUrl}`);
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
