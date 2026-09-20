import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { Quiz, QuizQuestion } from '../../../core/models/quiz.model';
import { Topbar } from '../../../shared/topbar/topbar';
import { canManageCourse } from '../../../core/utils/permissions.util';

@Component({
  selector: 'app-quiz-manage',
  standalone: true,
  imports: [CommonModule, RouterLink, Topbar],
  templateUrl: './quiz-manage.html',
  styleUrl: './quiz-manage.css',
})
export class QuizManage implements OnInit {
  courseId = signal<string | null>(null);
  quizId = signal<string | null>(null);
  quiz = signal<Quiz | null>(null);
  questions = signal<QuizQuestion[]>([]);
  loading = signal(true);
  error = signal('');
  permissionDenied = signal(false);

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private courseService: CourseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const courseId = this.activatedRoute.snapshot.paramMap.get('courseId');
    const quizId = this.activatedRoute.snapshot.paramMap.get('quizId');
    if (!courseId || !quizId) return;
    this.courseId.set(courseId);
    this.quizId.set(quizId);

    this.quizService.getQuiz(courseId, quizId).subscribe({
      next: (quiz) => this.quiz.set(quiz),
      error: (err) => {
        this.error.set('Erro ao carregar quiz.');
        console.error(err);
      },
    });

    this.courseService.getById(courseId).subscribe({
      next: (course) => {
        if (!canManageCourse(this.authService.currentUser(), course.authorId)) {
          this.permissionDenied.set(true);
        }
      },
      error: (err) => console.error(err),
    });

    this.loadQuestions(courseId, quizId);
  }

  loadQuestions(courseId: string, quizId: string): void {
    this.quizService.listQuestions(courseId, quizId).subscribe({
      next: (questions) => {
        this.questions.set([...questions].sort((a, b) => a.order - b.order));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar perguntas.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  deleteQuestion(id: string): void {
    const courseId = this.courseId();
    const quizId = this.quizId();
    if (!courseId || !quizId) return;
    if (!confirm('Tem certeza que deseja remover esta pergunta?')) return;

    this.quizService.deleteQuestion(courseId, quizId, id).subscribe({
      next: () => this.loadQuestions(courseId, quizId),
      error: (err) => {
        this.error.set('Erro ao remover pergunta.');
        console.error(err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/courses', this.courseId(), 'quiz']);
  }
}
