import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { QuizService } from '../../../core/services/quiz.service';
import { Course } from '../../../core/models/course.model';
import { QuizQuestion } from '../../../core/models/quiz.model';
import { Topbar } from '../../../shared/topbar/topbar';

@Component({
  selector: 'app-quiz-manage',
  standalone: true,
  imports: [CommonModule, RouterLink, Topbar],
  templateUrl: './quiz-manage.html',
  styleUrl: './quiz-manage.css',
})
export class QuizManage implements OnInit {
  courseId = signal<string | null>(null);
  course = signal<Course | null>(null);
  questions = signal<QuizQuestion[]>([]);
  loading = signal(true);
  error = signal('');

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
      error: (err) => {
        this.error.set('Erro ao carregar curso.');
        console.error(err);
      },
    });

    this.loadQuestions(courseId);
  }

  loadQuestions(courseId: string): void {
    this.quizService.listQuestions(courseId).subscribe({
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
    if (!courseId) return;
    if (!confirm('Tem certeza que deseja remover esta pergunta?')) return;

    this.quizService.deleteQuestion(courseId, id).subscribe({
      next: () => this.loadQuestions(courseId),
      error: (err) => {
        this.error.set('Erro ao remover pergunta.');
        console.error(err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/quizzes']);
  }
}
