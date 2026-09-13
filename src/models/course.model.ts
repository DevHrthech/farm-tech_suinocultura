import prisma from "../lib/prisma";

const PROJETO_ID = "5119fe85-1f7e-44d3-b50c-fbf97e64c33c";

export const CourseModel = {
  findAll: (tenantId: string) =>
    prisma.course.findMany({ where: { tenantId } }),

  findById: (id: string, tenantId: string) =>
    prisma.course.findFirst({ where: { id, tenantId } }),

  create: (data: {
    title: string;
    description: string;
    category: string;
    authorId: string;
    tenantId: string;
  }) => {
    return prisma.course.create({
      data: {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description,
        category: data.category,
        authorId: data.authorId,
        tenantId: data.tenantId,
        idProjeto: PROJETO_ID,
      },
    });
  },

  update: (id: string, tenantId: string, data: Partial<any>) => {
    return prisma.course.updateMany({
      where: { id, tenantId },
      data,
    }).then((result) => {
      if (result.count === 0) return null;
      return prisma.course.findFirst({ where: { id, tenantId } });
    });
  },

  delete: (id: string, tenantId: string) => {
    return prisma.course.deleteMany({
      where: { id, tenantId },
    }).then((result) => result.count > 0);
  },

  seedCourses: async (adminUserId: string) => {
    const courses = [
      {
        id: "course-manejo-maternidade-001",
        title: "Manejo na Maternidade",
        description: "Cuidados essenciais com a porca e os leitões do parto ao desmame.",
        category: "maternidade",
      },
      {
        id: "course-nutricao-leitoes-001",
        title: "Nutrição de Leitões Lactentes",
        description: "Estratégias de alimentação para garantir ganho de peso saudável na fase de lactação.",
        category: "nutrição",
      },
      {
        id: "course-sanidade-maternidade-001",
        title: "Sanidade na Maternidade",
        description: "Prevenção de doenças e boas práticas de biosseguridade no setor de maternidade.",
        category: "sanidade",
      },
    ];

    for (const course of courses) {
      await prisma.course.upsert({
        where: { id: course.id },
        update: {},
        create: {
          ...course,
          authorId: adminUserId,
          tenantId: "tenant-1",
          idProjeto: PROJETO_ID,
        },
      });
    }

    console.log("✅ Cursos seed criados/atualizados com sucesso");
  },
};