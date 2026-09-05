export interface Course {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  category: string; // ex: "maternidade", "manejo de leitões"
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Armazenamento em memória (trocar por DB depois)
const COURSE_IDS = {
  MANEJO_MATERNIDADE: "course-manejo-maternidade-001",
  NUTRICAO_LEITOES: "course-nutricao-leitoes-001",
  SANIDADE_MATERNIDADE: "course-sanidade-maternidade-001",
};

const courses: Course[] = [
  {
    id: COURSE_IDS.MANEJO_MATERNIDADE,
    tenantId: "tenant-1",
    title: "Manejo na Maternidade",
    description: "Cuidados essenciais com a porca e os leitões do parto ao desmame.",
    category: "maternidade",
    authorId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: COURSE_IDS.NUTRICAO_LEITOES,
    tenantId: "tenant-1",
    title: "Nutrição de Leitões Lactentes",
    description: "Estratégias de alimentação para garantir ganho de peso saudável na fase de lactação.",
    category: "nutrição",
    authorId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: COURSE_IDS.SANIDADE_MATERNIDADE,
    tenantId: "tenant-1",
    title: "Sanidade na Maternidade",
    description: "Prevenção de doenças e boas práticas de biosseguridade no setor de maternidade.",
    category: "sanidade",
    authorId: "user-2",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export { COURSE_IDS };

export const CourseModel = {
  findAll: (tenantId: string) =>
    courses.filter((c) => c.tenantId === tenantId),

  findById: (id: string, tenantId: string) =>
    courses.find((c) => c.id === id && c.tenantId === tenantId),

  create: (data: Omit<Course, "id" | "createdAt" | "updatedAt">) => {
    const course: Course = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    courses.push(course);
    return course;
  },

  update: (id: string, tenantId: string, data: Partial<Course>) => {
    const course = CourseModel.findById(id, tenantId);
    if (!course) return null;
    Object.assign(course, data, { updatedAt: new Date() });
    return course;
  },

  delete: (id: string, tenantId: string) => {
    const index = courses.findIndex(
      (c) => c.id === id && c.tenantId === tenantId
    );
    if (index === -1) return false;
    courses.splice(index, 1);
    return true;
  },
};