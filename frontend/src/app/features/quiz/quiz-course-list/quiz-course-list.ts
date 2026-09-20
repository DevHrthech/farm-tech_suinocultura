import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CourseService } from '../../../core/services/course.service';
import { QuizService } from '../../../core/services/quiz.service';
import { AuthService } from '../../../core/services/auth.service';
import { Course } from '../../../core/models/course.model';
import { QuizSummary } from '../../../core/models/quiz.model';
import { Topbar } from '../../../shared/topbar/topbar';
import {
  categoryIcon as getCategoryIcon,
  categoryColor as getCategoryColor,
} from '../../../core/utils/display.util';
import { canAuthor } from '../../../core/utils/permissions.util';

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
  summaries = signal<Record<string, QuizSummary>>({});

  totalQuestions = computed(() =>
    Object.values(this.summaries()).reduce((sum, summary) => sum + summary.questionCount, 0)
  );

  coursesWithQuiz = computed(
    () => Object.values(this.summaries()).filter((summary) => summary.quizCount > 0).length
  );

  constructor(
    private courseService: CourseService,
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
        this.quizService.getSummary(course.id).pipe(
          map((summary) => [course.id, summary] as const),
          catchError(() => of([course.id, { quizCount: 0, questionCount: 0 }] as const))
        )
      )
    ).subscribe((entries) => {
      this.summaries.set(Object.fromEntries(entries));
    });
  }

  summary(courseId: string): QuizSummary | null {
    return this.summaries()[courseId] ?? null;
  }

  categoryIcon(category: string): string {
    return getCategoryIcon(category);
  }

  categoryColor(category: string): string {
    return getCategoryColor(category);
  }
}
