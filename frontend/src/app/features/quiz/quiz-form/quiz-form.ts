import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { QuizService } from '../../../core/services/quiz.service';
import { Course } from '../../../core/models/course.model';

@Component({
  selector: 'app-quiz-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quiz-form.html',
  styleUrl: './quiz-form.css',
})
export class QuizForm {
  private fb = inject(FormBuilder);
  private courseService = inject(CourseService);
  private quizService = inject(QuizService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  courses = signal<Course[]>([]);
  coursesLoading = signal(true);
  lockedCourse = signal<Course | null>(null);

  quizId = signal<string | null>(null);
  isEdit = signal(false);
  loading = signal(false);
  submitting = signal(false);
  submitError = signal('');

  form = this.fb.group({
    courseId: ['', Validators.required],
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
  });

  constructor() {
    effect(() => {
      const courseId = this.activatedRoute.snapshot.paramMap.get('courseId');
      const quizId = this.activatedRoute.snapshot.paramMap.get('quizId');
      const queryCourseId = this.activatedRoute.snapshot.queryParamMap.get('courseId');

      if (courseId && quizId) {
        this.isEdit.set(true);
        this.quizId.set(quizId);
        this.form.patchValue({ courseId });
        this.form.get('courseId')?.disable();
        this.loadCourse(courseId, (course) => this.lockedCourse.set(course));
        this.loadQuiz(courseId, quizId);
      } else {
        this.loadCourses(queryCourseId ?? courseId ?? undefined);
      }
    });
  }

  private loadCourses(preselectCourseId?: string): void {
    this.coursesLoading.set(true);
    this.courseService.list().subscribe({
      next: (courses) => {
        this.courses.set(courses);
        this.coursesLoading.set(false);
        if (preselectCourseId) {
          this.form.patchValue({ courseId: preselectCourseId });
        }
      },
      error: (err) => {
        this.submitError.set('Erro ao carregar cursos disponíveis.');
        this.coursesLoading.set(false);
        console.error(err);
      },
    });
  }

  private loadCourse(courseId: string, onLoaded: (course: Course) => void): void {
    this.courseService.getById(courseId).subscribe({
      next: onLoaded,
      error: (err) => console.error(err),
    });
  }

  private loadQuiz(courseId: string, quizId: string): void {
    this.loading.set(true);
    this.quizService.getQuiz(courseId, quizId).subscribe({
      next: (quiz) => {
        this.form.patchValue({
          title: quiz.title,
          description: quiz.description ?? '',
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.submitError.set('Erro ao carregar quiz.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submitError.set('');

    const value = this.form.getRawValue();
    const courseId = value.courseId!;
    const data = {
      title: value.title!,
      description: value.description ? value.description : null,
    };

    if (this.isEdit()) {
      this.quizService.updateQuiz(courseId, this.quizId()!, data).subscribe({
        next: () => this.router.navigate(['/courses', courseId, 'quiz']),
        error: (err) => this.handleError(err, 'atualizar'),
      });
    } else {
      this.quizService.createQuiz(courseId, data).subscribe({
        next: (quiz) => this.router.navigate(['/courses', courseId, 'quiz', quiz.id, 'questions']),
        error: (err) => this.handleError(err, 'criar'),
      });
    }
  }

  private handleError(err: any, action: string): void {
    this.submitError.set(`Erro ao ${action} quiz. Tente novamente.`);
    this.submitting.set(false);
    console.error(err);
  }

  goBack(): void {
    const courseId = this.form.getRawValue().courseId;
    if (this.isEdit() && courseId) {
      this.router.navigate(['/courses', courseId, 'quiz']);
    } else {
      this.router.navigate(['/quizzes']);
    }
  }
}
