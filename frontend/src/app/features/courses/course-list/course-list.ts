import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CourseService } from '../../../core/services/course.service';
import { LessonService } from '../../../core/services/lesson.service';
import { QuizService } from '../../../core/services/quiz.service';
import { AuthService } from '../../../core/services/auth.service';
import { Course } from '../../../core/models/course.model';
import { Lesson } from '../../../core/models/lesson.model';
import { QuizSummary } from '../../../core/models/quiz.model';
import { Topbar } from '../../../shared/topbar/topbar';
import {
  categoryIcon as getCategoryIcon,
  categoryColor as getCategoryColor,
} from '../../../core/utils/display.util';
import { canAuthor } from '../../../core/utils/permissions.util';

export type CourseStatus = 'in_progress' | 'not_started' | 'completed' | 'empty';

export interface CourseProgress {
  total: number;
  completed: number;
  percent: number;
  nextLesson: Lesson | null;
  status: CourseStatus;
}

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterLink, Topbar],
  templateUrl: './course-list.html',
  styleUrl: './course-list.css'
})
export class CourseList implements OnInit {
  courses = signal<Course[]>([]);
  loading = signal(true);
  error = signal('');
  lessonsByCourse = signal<Record<string, Lesson[]>>({});
  quizSummaries = signal<Record<string, QuizSummary>>({});

  searchTerm = signal('');
  selectedCategory = signal<string | null>(null);
  selectedStatus = signal<'all' | CourseStatus>('all');

  categories = computed(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const course of this.courses()) {
      const category = (course.category ?? '').trim();
      if (category && !seen.has(category)) {
        seen.add(category);
        list.push(category);
      }
    }
    return list;
  });

  progressByCourse = computed(() => {
    const lessonsMap = this.lessonsByCourse();
    const result: Record<string, CourseProgress> = {};
    for (const course of this.courses()) {
      const lessons = [...(lessonsMap[course.id] ?? [])].sort((a, b) => a.order - b.order);
      const total = lessons.length;
      const completed = lessons.filter((lesson) => lesson.completed).length;
      const nextLesson = lessons.find((lesson) => !lesson.completed) ?? null;

      let status: CourseStatus;
      if (total === 0) status = 'empty';
      else if (completed === total) status = 'completed';
      else if (completed > 0) status = 'in_progress';
      else status = 'not_started';

      result[course.id] = {
        total,
        completed,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        nextLesson,
        status
      };
    }
    return result;
  });

  statusCounts = computed(() => {
    const progress = Object.values(this.progressByCourse());
    return {
      all: this.courses().length,
      in_progress: progress.filter((p) => p.status === 'in_progress').length,
      not_started: progress.filter((p) => p.status === 'not_started').length,
      completed: progress.filter((p) => p.status === 'completed').length
    };
  });

  filteredCourses = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.selectedCategory();
    const status = this.selectedStatus();
    const progress = this.progressByCourse();
    return this.courses().filter((course) => {
      const matchesCategory = !category || course.category === category;
      const matchesTerm =
        !term ||
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term);
      const matchesStatus = status === 'all' || progress[course.id]?.status === status;
      return matchesCategory && matchesTerm && matchesStatus;
    });
  });

  totalLessons = computed(() =>
    Object.values(this.progressByCourse()).reduce((sum, p) => sum + p.total, 0)
  );

  constructor(
    private courseService: CourseService,
    private lessonService: LessonService,
    private quizService: QuizService,
    private authService: AuthService
  ) {}

  canAuthor(): boolean {
    return canAuthor(this.authService.currentUser());
  }

  ngOnInit(): void {
    this.courseService.list().subscribe({
      next: (data) => {
        this.courses.set(data);
        this.loading.set(false);
        this.loadLessonsByCourse(data);
        this.loadQuizSummaries(data);
      },
      error: (err) => {
        this.error.set('Erro ao carregar cursos. Verifique se o backend está rodando.');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  private loadLessonsByCourse(courses: Course[]): void {
    if (courses.length === 0) return;

    forkJoin(
      courses.map((course) =>
        this.lessonService.listByCourse(course.id).pipe(
          map((lessons) => [course.id, lessons] as const),
          catchError(() => of([course.id, []] as const))
        )
      )
    ).subscribe((entries) => {
      this.lessonsByCourse.set(Object.fromEntries(entries));
    });
  }

  private loadQuizSummaries(courses: Course[]): void {
    if (courses.length === 0) return;

    forkJoin(
      courses.map((course) =>
        this.quizService.getSummary(course.id).pipe(
          map((summary) => [course.id, summary] as const),
          catchError(() => of([course.id, { quizCount: 0, questionCount: 0 }] as const))
        )
      )
    ).subscribe((entries) => {
      this.quizSummaries.set(Object.fromEntries(entries));
    });
  }

  quizSummary(courseId: string): QuizSummary {
    return this.quizSummaries()[courseId] ?? { quizCount: 0, questionCount: 0 };
  }

  progress(courseId: string): CourseProgress {
    return (
      this.progressByCourse()[courseId] ?? {
        total: 0,
        completed: 0,
        percent: 0,
        nextLesson: null,
        status: 'empty'
      }
    );
  }

  categoryIcon(category: string): string {
    return getCategoryIcon(category);
  }

  categoryColor(category: string): string {
    return getCategoryColor(category);
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  selectCategory(category: string | null): void {
    this.selectedCategory.set(category);
  }

  selectStatus(status: 'all' | CourseStatus): void {
    this.selectedStatus.set(status);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set(null);
    this.selectedStatus.set('all');
  }
}
