export interface Lesson {
  id: string;
  courseId: string;
  tenantId: string;
  title: string;
  description: string;
  videoId: string; // YouTube video ID
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const lessons: Lesson[] = [];

export const LessonModel = {
  findByCourseId: (courseId: string, tenantId: string) =>
    lessons
      .filter((l) => l.courseId === courseId && l.tenantId === tenantId)
      .sort((a, b) => a.order - b.order),

  findById: (id: string, tenantId: string) =>
    lessons.find((l) => l.id === id && l.tenantId === tenantId),

  create: (data: Omit<Lesson, "id" | "createdAt" | "updatedAt">) => {
    const lesson: Lesson = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    lessons.push(lesson);
    return lesson;
  },

  update: (id: string, tenantId: string, data: Partial<Lesson>) => {
    const lesson = LessonModel.findById(id, tenantId);
    if (!lesson) return null;
    Object.assign(lesson, data, { updatedAt: new Date() });
    return lesson;
  },

  delete: (id: string, tenantId: string) => {
    const index = lessons.findIndex(
      (l) => l.id === id && l.tenantId === tenantId
    );
    if (index === -1) return false;
    lessons.splice(index, 1);
    return true;
  },
};
