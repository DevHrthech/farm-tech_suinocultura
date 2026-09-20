import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { Topbar } from '../../../shared/topbar/topbar';
import { categoryIcon as getCategoryIcon } from '../../../core/utils/display.util';

const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, Topbar],
  templateUrl: './course-form.html',
  styleUrl: './course-form.css'
})
export class CourseForm {
  private fb = inject(FormBuilder);
  private courseService = inject(CourseService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  categories = ['maternidade', 'nutrição', 'sanidade', 'manejo', 'genética', 'bem-estar animal'];
  courseId = signal<string | null>(null);
  isEdit = signal(false);
  loading = signal(false);

  authorName = signal<string | null>(null);

  coverImagePreview = signal<string | null>(null);
  coverImageError = signal('');

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
      } else {
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          this.form.patchValue({ authorId: currentUser.id });
          this.authorName.set(currentUser.nomeCompleto);
        }
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
        this.coverImagePreview.set(course.coverImageUrl ?? null);
        this.loading.set(false);
        this.loadAuthorName(course.authorId);
      },
      error: (err) => {
        this.submitError = 'Erro ao carregar curso.';
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  private loadAuthorName(authorId: string): void {
    const currentUser = this.authService.currentUser();
    if (currentUser && currentUser.id === authorId) {
      this.authorName.set(currentUser.nomeCompleto);
      return;
    }

    this.userService.getById(authorId).subscribe({
      next: (user) => this.authorName.set(user.nomeCompleto),
      error: (err) => {
        this.authorName.set('Autor não encontrado');
        console.error(err);
      }
    });
  }

  categoryIcon(category: string): string {
    return getCategoryIcon(category);
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.coverImageError.set('');

    if (!file.type.startsWith('image/')) {
      this.coverImageError.set('Selecione um arquivo de imagem válido.');
      input.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      this.coverImageError.set('A imagem deve ter no máximo 3MB.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.coverImagePreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  removeCover(): void {
    this.coverImagePreview.set(null);
    this.coverImageError.set('');
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
      authorId: value.authorId!,
      coverImageUrl: this.coverImagePreview()
    };

    const request$ = this.isEdit()
      ? this.courseService.update(this.courseId()!, data)
      : this.courseService.create(data);

    request$.subscribe({
      next: (course) => {
        this.router.navigate(['/courses', course.id]);
      },
      error: (err) => {
        this.submitError = `Erro ao ${this.isEdit() ? 'atualizar' : 'criar'} curso. Tente novamente.`;
        this.submitting = false;
        console.error(err);
      }
    });
  }
}
