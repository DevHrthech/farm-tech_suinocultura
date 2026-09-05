import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CourseService } from '../../../core/services/course.service';
import { LessonService } from '../../../core/services/lesson.service';
import { Course } from '../../../core/models/course.model';
import { Lesson } from '../../../core/models/lesson.model';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './course-detail.html',
  styleUrl: './course-detail.css'
})
export class CourseDetail {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);
  private lessonService = inject(LessonService);

  courseId = signal<string | null>(null);
  course = signal<Course | null>(null);
  lessons = signal<Lesson[]>([]);
  loading = signal(true);
  error = signal('');

  constructor() {
    effect(() => {
      const id = this.activatedRoute.snapshot.paramMap.get('id');
      if (id) {
        this.courseId.set(id);
        this.loadCourse(id);
        this.loadLessons(id);
      }
    });
  }

  loadCourse(id: string): void {
    this.courseService.getById(id).subscribe({
      next: (course) => {
        this.course.set(course);
      },
      error: (err) => {
        this.error.set('Erro ao carregar curso.');
        console.error(err);
      }
    });
  }

  loadLessons(courseId: string): void {
    this.lessonService.listByCourse(courseId).subscribe({
      next: (lessons) => {
        this.lessons.set(lessons);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar aulas.');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  deleteLesson(lessonId: string): void {
    if (confirm('Tem certeza que deseja deletar esta aula?')) {
      this.lessonService.delete(this.courseId()!, lessonId).subscribe({
        next: () => {
          this.loadLessons(this.courseId()!);
        },
        error: (err) => {
          this.error.set('Erro ao deletar aula.');
          console.error(err);
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/courses']);
  }
}
