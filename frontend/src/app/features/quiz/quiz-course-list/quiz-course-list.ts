import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CourseService } from '../../../core/services/course.service';
import { QuizService } from '../../../core/services/quiz.service';
import { Course } from '../../../core/models/course.model';
import { QuizAttempt } from '../../../core/models/quiz.model';
import { Topbar } from '../../../shared/topbar/topbar';
import {
  categoryIcon as getCategoryIcon,
  categoryColor as getCategoryColor,
} from '../../../core/utils/display.util';

@Component({
  selector: 'app-quiz-course-list',
  standalone: true,
  imports: [CommonModule, RouterLink, Topbar],
  templateUrl: './quiz-course-list.html',
  styleUrl: './quiz-course-list.css',
})
export class QuizCourseList implements OnInit {
  courses = signal<Course[]>([]);
  loading = signal(true);
  error = signal('');
  questionCounts = signal<Record<string, number>>({});
  lastAttempts = signal<Record<string, QuizAttempt | null>>({});

  totalQuestions = computed(() =>
    Object.values(this.questionCounts()).reduce((sum, count) => sum + count, 0)
  );

  coursesWithQuiz = computed(
    () => Object.values(this.questionCounts()).filter((count) => count > 0).length
  );

  constructor(
    private courseService: CourseService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.courseService.list().subscribe({
      next: (data) => {
        this.courses.set(data);
        this.loading.set(false);
        this.loadQuizInfo(data);
      },
      error: (err) => {
        this.error.set('Erro ao carregar cursos. Verifique se o backend está rodando.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  private loadQuizInfo(courses: Course[]): void {
    if (courses.length === 0) return;

    forkJoin(
      courses.map((course) =>
        this.quizService.listQuestions(course.id).pipe(
          map((questions) => [course.id, questions.length] as const),
          catchError(() => of([course.id, 0] as const))
        )
      )
    ).subscribe((entries) => {
      this.questionCounts.set(Object.fromEntries(entries));
    });

    forkJoin(
      courses.map((course) =>
        this.quizService.getLastAttempt(course.id).pipe(
          map((attempt) => [course.id, attempt] as const),
          catchError(() => of([course.id, null] as const))
        )
      )
    ).subscribe((entries) => {
      this.lastAttempts.set(Object.fromEntries(entries));
    });
  }

  questionCount(courseId: string): number | null {
    const counts = this.questionCounts();
    return courseId in counts ? counts[courseId] : null;
  }

  lastAttempt(courseId: string): QuizAttempt | null {
    return this.lastAttempts()[courseId] ?? null;
  }

  lastScorePercent(courseId: string): number | null {
    const attempt = this.lastAttempt(courseId);
    if (!attempt || attempt.total === 0) return null;
    return Math.round((attempt.score / attempt.total) * 100);
  }

  categoryIcon(category: string): string {
    return getCategoryIcon(category);
  }

  categoryColor(category: string): string {
    return getCategoryColor(category);
  }
}
