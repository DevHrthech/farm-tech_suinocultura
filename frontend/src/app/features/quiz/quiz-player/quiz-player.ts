import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { QuizService } from '../../../core/services/quiz.service';
import { Course } from '../../../core/models/course.model';
import { Quiz, QuizQuestion } from '../../../core/models/quiz.model';
import { Topbar } from '../../../shared/topbar/topbar';

interface Answer {
  selectedIndex: number | null;
  correct: boolean;
}

@Component({
  selector: 'app-quiz-player',
  standalone: true,
  imports: [CommonModule, RouterLink, Topbar],
  templateUrl: './quiz-player.html',
  styleUrl: './quiz-player.css',
})
export class QuizPlayer implements OnInit {
  courseId = signal<string | null>(null);
  quizId = signal<string | null>(null);
  course = signal<Course | null>(null);
  quiz = signal<Quiz | null>(null);
  questions = signal<QuizQuestion[]>([]);
  loading = signal(true);
  error = signal('');

  currentIndex = signal(0);
  selectedIndex = signal<number | null>(null);
  confirmed = signal(false);
  answers = signal<Record<string, Answer>>({});
  finished = signal(false);
  submitting = signal(false);
  saveError = signal('');

  currentQuestion = computed<QuizQuestion | null>(() => this.questions()[this.currentIndex()] ?? null);

  totalQuestions = computed(() => this.questions().length);

  progressPercent = computed(() => {
    const total = this.totalQuestions();
    if (total === 0) return 0;
    return Math.round(((this.currentIndex() + 1) / total) * 100);
  });

  isLastQuestion = computed(() => this.currentIndex() === this.totalQuestions() - 1);

  correctCount = computed(
    () => Object.values(this.answers()).filter((answer) => answer.correct).length
  );

  scorePercent = computed(() => {
    const total = this.totalQuestions();
    if (total === 0) return 0;
    return Math.round((this.correctCount() / total) * 100);
  });

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    const courseId = this.activatedRoute.snapshot.paramMap.get('courseId');
    const quizId = this.activatedRoute.snapshot.paramMap.get('quizId');
    if (!courseId || !quizId) return;
    this.courseId.set(courseId);
    this.quizId.set(quizId);

    this.courseService.getById(courseId).subscribe({
      next: (course) => this.course.set(course),
      error: (err) => {
        this.error.set('Erro ao carregar curso.');
        console.error(err);
      },
    });

    this.quizService.getQuiz(courseId, quizId).subscribe({
      next: (quiz) => this.quiz.set(quiz),
      error: (err) => console.error(err),
    });

    this.quizService.listQuestions(courseId, quizId).subscribe({
      next: (questions) => {
        this.questions.set([...questions].sort((a, b) => a.order - b.order));
        this.loading.set(false);
        if (questions.length === 0) {
          this.error.set('Este quiz ainda não possui perguntas cadastradas.');
        }
      },
      error: (err) => {
        this.error.set('Erro ao carregar perguntas do quiz.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  selectOption(index: number): void {
    if (this.confirmed()) return;
    this.selectedIndex.set(index);
  }

  confirmAnswer(): void {
    const question = this.currentQuestion();
    const selected = this.selectedIndex();
    if (!question || selected === null || this.confirmed()) return;

    const correct = selected === question.correctIndex;
    this.answers.update((current) => ({
      ...current,
      [question.id]: { selectedIndex: selected, correct },
    }));
    this.confirmed.set(true);
  }

  skipQuestion(): void {
    const question = this.currentQuestion();
    if (!question || this.confirmed()) return;

    this.answers.update((current) => ({
      ...current,
      [question.id]: { selectedIndex: null, correct: false },
    }));
    this.goToNext();
  }

  goToNext(): void {
    if (this.isLastQuestion()) {
      this.finishQuiz();
      return;
    }
    this.currentIndex.update((i) => i + 1);
    this.selectedIndex.set(null);
    this.confirmed.set(false);
  }

  private finishQuiz(): void {
    const courseId = this.courseId();
    const quizId = this.quizId();
    if (!courseId || !quizId) return;

    this.submitting.set(true);
    this.saveError.set('');

    this.quizService.submitAttempt(courseId, quizId, this.correctCount(), this.totalQuestions()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.finished.set(true);
      },
      error: (err) => {
        console.error(err);
        this.submitting.set(false);
        this.saveError.set('Não foi possível salvar o resultado, mas aqui está seu desempenho:');
        this.finished.set(true);
      },
    });
  }

  restart(): void {
    this.currentIndex.set(0);
    this.selectedIndex.set(null);
    this.confirmed.set(false);
    this.answers.set({});
    this.finished.set(false);
    this.saveError.set('');
  }

  answerFor(questionId: string): Answer | null {
    return this.answers()[questionId] ?? null;
  }
}
