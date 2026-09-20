export interface Quiz {
  id: string;
  courseId: string;
  tenantId: string;
  title: string;
  description: string | null;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuizSummary {
  quizCount: number;
  questionCount: number;
}

export interface QuizQuestion {
  id: string;
  courseId: string;
  quizId: string;
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
  quizId: string | null;
  score: number;
  total: number;
  completedAt: string;
}
