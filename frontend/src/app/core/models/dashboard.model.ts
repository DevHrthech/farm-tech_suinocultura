export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  category: string;
  coverImageUrl?: string | null;
  totalLessons: number;
  completedLessons: number;
  percent: number;
}

export interface LastLesson {
  lessonId: string;
  lessonTitle: string;
  courseId: string;
  courseTitle: string;
  watchedAt: string;
}

export interface ActivityItem {
  type: 'lesson' | 'quiz';
  at: string;
  courseId: string;
  courseTitle: string;
  lessonTitle?: string;
  score?: number;
  total?: number;
}

export interface DashboardStats {
  totalCourses: number;
  coursesStarted: number;
  coursesCompleted: number;
  totalLessons: number;
  totalCompleted: number;
  quizzesTaken: number;
  avgQuizScore: number | null;
}

export interface DashboardData {
  coursesProgress: CourseProgress[];
  lastLesson: LastLesson | null;
  activity: ActivityItem[];
  stats: DashboardStats;
}
