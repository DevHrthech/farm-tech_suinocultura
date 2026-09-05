import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CourseService } from '../../../core/services/course.service';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './course-form.html',
  styleUrl: './course-form.css'
})
export class CourseForm {
  private fb = inject(FormBuilder);
  private courseService = inject(CourseService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  categories = ['maternidade', 'nutrição', 'sanidade', 'manejo', 'genética', 'bem-estar animal'];
  courseId = signal<string | null>(null);
  isEdit = signal(false);
  loading = signal(false);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    category: ['', Validators.required],
    authorId: ['', Validators.required]
  });

  submitting = false;
  submitError = '';

  constructor() {
    effect(() => {
      const id = this.activatedRoute.snapshot.paramMap.get('id');
      if (id) {
        this.courseId.set(id);
        this.isEdit.set(true);
        this.loadCourse(id);
      }
    });
  }

  loadCourse(id: string): void {
    this.loading.set(true);
    this.courseService.getById(id).subscribe({
      next: (course) => {
        this.form.patchValue({
          title: course.title,
          description: course.description,
          category: course.category,
          authorId: course.authorId
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.submitError = 'Erro ao carregar curso.';
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.submitError = '';

    const value = this.form.getRawValue();
    const data = {
      title: value.title!,
      description: value.description!,
      category: value.category!,
      authorId: value.authorId!
    };

    const request$ = this.isEdit()
      ? this.courseService.update(this.courseId()!, data)
      : this.courseService.create(data);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/courses']);
      },
      error: (err) => {
        this.submitError = `Erro ao ${this.isEdit() ? 'atualizar' : 'criar'} curso. Tente novamente.`;
        this.submitting = false;
        console.error(err);
      }
    });
  }
}