export interface Lesson {
  id: string;
  courseId: string;
  tenantId: string;
  title: string;
  description: string;
  videoId: string;
  order: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}
