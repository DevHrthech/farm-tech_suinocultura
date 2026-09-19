export interface QuizQuestion {
  id: string;
  courseId: string;
  tenantId: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  courseId: string;
  score: number;
  total: number;
  completedAt: string;
}
