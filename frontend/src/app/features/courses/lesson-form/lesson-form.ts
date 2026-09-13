import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LessonService } from '../../../core/services/lesson.service';

@Component({
  selector: 'app-lesson-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './lesson-form.html',
  styleUrl: './lesson-form.css'
})
export class LessonForm {
  private fb = inject(FormBuilder);
  private lessonService = inject(LessonService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  courseId = signal<string | null>(null);
  lessonId = signal<string | null>(null);
  isEdit = signal(false);
  loading = signal(false);
  videoPreview = signal<string>('');

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    videoId: ['', [Validators.required, Validators.pattern(/^[\w-]{11}$/)]],
    order: [0, Validators.required]
  });

  submitting = false;
  submitError = '';

  constructor() {
    effect(() => {
      const cid = this.activatedRoute.snapshot.paramMap.get('courseId');
      const lid = this.activatedRoute.snapshot.paramMap.get('lessonId');
      if (cid) {
        this.courseId.set(cid);
      }
      if (lid) {
        this.lessonId.set(lid);
        this.isEdit.set(true);
        this.loadLesson(cid!, lid);
      }
    });
  }

  loadLesson(courseId: string, id: string): void {
    this.loading.set(true);
    this.lessonService.getById(courseId, id).subscribe({
      next: (lesson) => {
        this.form.patchValue({
          title: lesson.title,
          description: lesson.description,
          videoId: lesson.videoId,
          order: lesson.order
        });
        this.updateVideoPreview(lesson.videoId);
        this.loading.set(false);
      },
      error: (err) => {
        this.submitError = 'Erro ao carregar aula.';
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  onVideoIdChange(): void {
    const videoId = this.form.get('videoId')?.value;
    if (videoId && /^[\w-]{11}$/.test(videoId)) {
      this.updateVideoPreview(videoId);
    }
  }

  updateVideoPreview(videoId: string): void {
    this.videoPreview.set(`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`);
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
      videoId: value.videoId!,
      order: value.order!
    };

    const request$ = this.isEdit()
      ? this.lessonService.update(this.courseId()!, this.lessonId()!, data)
      : this.lessonService.create(this.courseId()!, data);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/courses', this.courseId()]);
      },
      error: (err) => {
        this.submitError = `Erro ao ${this.isEdit() ? 'atualizar' : 'criar'} aula. Tente novamente.`;
        this.submitting = false;
        console.error(err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/courses', this.courseId()]);
  }
}
