import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CourseService } from '../../../core/services/course.service';
import { QuizService } from '../../../core/services/quiz.service';
import { Course } from '../../../core/models/course.model';
import { Quiz, QuizAttempt } from '../../../core/models/quiz.model';
import { Topbar } from '../../../shared/topbar/topbar';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule, RouterLink, Topbar],
  templateUrl: './quiz-list.html',
  styleUrl: './quiz-list.css',
})
export class QuizList implements OnInit {
  courseId = signal<string | null>(null);
  course = signal<Course | null>(null);
  quizzes = signal<Quiz[]>([]);
  lastAttempts = signal<Record<string, QuizAttempt | null>>({});
  loading = signal(true);
  error = signal('');

  totalQuestions = computed(() =>
    this.quizzes().reduce((sum, quiz) => sum + quiz.questionCount, 0)
  );

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    const courseId = this.activatedRoute.snapshot.paramMap.get('courseId');
    if (!courseId) return;
    this.courseId.set(courseId);

    this.courseService.getById(courseId).subscribe({
      next: (course) => this.course.set(course),
      error: (err) => console.error(err),
    });

    this.loadQuizzes(courseId);
  }

  loadQuizzes(courseId: string): void {
    this.loading.set(true);
    this.quizService.listQuizzes(courseId).subscribe({
      next: (quizzes) => {
        this.quizzes.set(quizzes);
        this.loading.set(false);
        this.loadLastAttempts(courseId, quizzes);
      },
      error: (err) => {
        this.error.set('Erro ao carregar quizzes deste curso.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  private loadLastAttempts(courseId: string, quizzes: Quiz[]): void {
    if (quizzes.length === 0) return;

    forkJoin(
      quizzes.map((quiz) =>
        this.quizService.getLastAttempt(courseId, quiz.id).pipe(
          map((attempt) => [quiz.id, attempt] as const),
          catchError(() => of([quiz.id, null] as const))
        )
      )
    ).subscribe((entries) => {
      this.lastAttempts.set(Object.fromEntries(entries));
    });
  }

  lastScorePercent(quizId: string): number | null {
    const attempt = this.lastAttempts()[quizId];
    if (!attempt || attempt.total === 0) return null;
    return Math.round((attempt.score / attempt.total) * 100);
  }

  deleteQuiz(quizId: string): void {
    const courseId = this.courseId();
    if (!courseId) return;
    if (!confirm('Tem certeza que deseja remover este quiz e todas as suas perguntas?')) return;

    this.quizService.deleteQuiz(courseId, quizId).subscribe({
      next: () => this.loadQuizzes(courseId),
      error: (err) => {
        this.error.set('Erro ao remover quiz.');
        console.error(err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/courses', this.courseId()]);
  }
}
