import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';

@Component({
  selector: 'app-quiz-question-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quiz-question-form.html',
  styleUrl: './quiz-question-form.css',
})
export class QuizQuestionForm {
  private fb = inject(FormBuilder);
  private quizService = inject(QuizService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  courseId = signal<string | null>(null);
  quizId = signal<string | null>(null);
  questionId = signal<string | null>(null);
  isEdit = signal(false);
  loading = signal(false);
  submitting = signal(false);
  submitError = signal('');

  form = this.fb.group({
    text: ['', [Validators.required, Validators.minLength(10)]],
    options: this.fb.array([
      this.fb.control('', Validators.required),
      this.fb.control('', Validators.required),
      this.fb.control('', Validators.required),
      this.fb.control('', Validators.required),
    ]),
    correctIndex: [0, Validators.required],
    explanation: [''],
    order: [1, [Validators.required, Validators.min(1)]],
  });

  get options(): FormArray {
    return this.form.get('options') as FormArray;
  }

  constructor() {
    effect(() => {
      const courseId = this.activatedRoute.snapshot.paramMap.get('courseId');
      const quizId = this.activatedRoute.snapshot.paramMap.get('quizId');
      const questionId = this.activatedRoute.snapshot.paramMap.get('questionId');
      if (courseId) this.courseId.set(courseId);
      if (quizId) this.quizId.set(quizId);
      if (courseId && quizId && questionId) {
        this.questionId.set(questionId);
        this.isEdit.set(true);
        this.loadQuestion(courseId, quizId, questionId);
      }
    });
  }

  private loadQuestion(courseId: string, quizId: string, id: string): void {
    this.loading.set(true);
    this.quizService.listQuestions(courseId, quizId).subscribe({
      next: (questions) => {
        const question = questions.find((item) => item.id === id);
        if (question) {
          this.options.clear();
          question.options.forEach((option) =>
            this.options.push(this.fb.control(option, Validators.required))
          );
          this.form.patchValue({
            text: question.text,
            correctIndex: question.correctIndex,
            explanation: question.explanation ?? '',
            order: question.order,
          });
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.submitError.set('Erro ao carregar pergunta.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  addOption(): void {
    if (this.options.length >= 6) return;
    this.options.push(this.fb.control('', Validators.required));
  }

  removeOption(index: number): void {
    if (this.options.length <= 2) return;
    this.options.removeAt(index);

    const correctIndex = this.form.get('correctIndex')?.value ?? 0;
    if (correctIndex === index) {
      this.form.patchValue({ correctIndex: 0 });
    } else if (correctIndex > index) {
      this.form.patchValue({ correctIndex: correctIndex - 1 });
    }
  }

  selectCorrect(index: number): void {
    this.form.patchValue({ correctIndex: index });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const courseId = this.courseId();
    const quizId = this.quizId();
    if (!courseId || !quizId) return;

    this.submitting.set(true);
    this.submitError.set('');

    const value = this.form.getRawValue();
    const data = {
      text: value.text!,
      options: value.options as string[],
      correctIndex: value.correctIndex!,
      explanation: value.explanation ? value.explanation : null,
      order: value.order!,
    };

    const request$ = this.isEdit()
      ? this.quizService.updateQuestion(courseId, quizId, this.questionId()!, data)
      : this.quizService.createQuestion(courseId, quizId, data);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/courses', courseId, 'quiz', quizId, 'questions']);
      },
      error: (err) => {
        this.submitError.set(`Erro ao ${this.isEdit() ? 'atualizar' : 'criar'} pergunta. Tente novamente.`);
        this.submitting.set(false);
        console.error(err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/courses', this.courseId(), 'quiz', this.quizId(), 'questions']);
  }
}
