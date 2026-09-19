import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CourseService } from '../../../core/services/course.service';
import { LessonService } from '../../../core/services/lesson.service';
import { Course } from '../../../core/models/course.model';
import { Topbar } from '../../../shared/topbar/topbar';
import {
  categoryIcon as getCategoryIcon,
  categoryColor as getCategoryColor,
} from '../../../core/utils/display.util';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterLink, Topbar],
  templateUrl: './course-list.html',
  styleUrl: './course-list.css'
})
export class CourseList implements OnInit {
  courses = signal<Course[]>([]);
  loading = signal(true);
  error = signal('');
  lessonCounts = signal<Record<string, number>>({});

  searchTerm = signal('');
  selectedCategory = signal<string | null>(null);

  categories = computed(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const course of this.courses()) {
      const category = (course.category ?? '').trim();
      if (category && !seen.has(category)) {
        seen.add(category);
        list.push(category);
      }
    }
    return list;
  });

  filteredCourses = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.selectedCategory();
    return this.courses().filter((course) => {
      const matchesCategory = !category || course.category === category;
      const matchesTerm =
        !term ||
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term);
      return matchesCategory && matchesTerm;
    });
  });

  totalLessons = computed(() =>
    Object.values(this.lessonCounts()).reduce((sum, count) => sum + count, 0)
  );

  constructor(
    private courseService: CourseService,
    private lessonService: LessonService
  ) {}

  ngOnInit(): void {
    this.courseService.list().subscribe({
      next: (data) => {
        this.courses.set(data);
        this.loading.set(false);
        this.loadLessonCounts(data);
      },
      error: (err) => {
        this.error.set('Erro ao carregar cursos. Verifique se o backend está rodando.');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  private loadLessonCounts(courses: Course[]): void {
    if (courses.length === 0) return;

    forkJoin(
      courses.map((course) =>
        this.lessonService.listByCourse(course.id).pipe(
          map((lessons) => [course.id, lessons.length] as const),
          catchError(() => of([course.id, 0] as const))
        )
      )
    ).subscribe((entries) => {
      this.lessonCounts.set(Object.fromEntries(entries));
    });
  }

  lessonCount(courseId: string): number | null {
    const counts = this.lessonCounts();
    return courseId in counts ? counts[courseId] : null;
  }

  categoryIcon(category: string): string {
    return getCategoryIcon(category);
  }

  categoryColor(category: string): string {
    return getCategoryColor(category);
  }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  selectCategory(category: string | null): void {
    this.selectedCategory.set(category);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set(null);
  }
}
