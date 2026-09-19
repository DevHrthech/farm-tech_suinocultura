import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CourseService } from '../../../core/services/course.service';
import { LessonService } from '../../../core/services/lesson.service';
import { Course } from '../../../core/models/course.model';
import { Lesson } from '../../../core/models/lesson.model';
import { Topbar } from '../../../shared/topbar/topbar';

@Component({
  selector: 'app-lesson-player',
  standalone: true,
  imports: [CommonModule, RouterLink, Topbar],
  templateUrl: './lesson-player.html',
  styleUrl: './lesson-player.css',
})
export class LessonPlayer implements OnInit {
  course = signal<Course | null>(null);
  lessons = signal<Lesson[]>([]);
  courseId = signal<string | null>(null);
  lessonId = signal<string | null>(null);
  loading = signal(true);
  error = signal('');
  updatingCompletion = signal(false);

  currentLesson = computed<Lesson | null>(() => {
    const id = this.lessonId();
    return this.lessons().find((lesson) => lesson.id === id) ?? null;
  });

  currentIndex = computed(() => {
    const id = this.lessonId();
    return this.lessons().findIndex((lesson) => lesson.id === id);
  });

  previousLesson = computed<Lesson | null>(() => {
    const index = this.currentIndex();
    return index > 0 ? this.lessons()[index - 1] : null;
  });

  nextLesson = computed<Lesson | null>(() => {
    const index = this.currentIndex();
    const list = this.lessons();
    return index >= 0 && index < list.length - 1 ? list[index + 1] : null;
  });

  completedCount = computed(() => this.lessons().filter((lesson) => lesson.completed).length);

  progressPercent = computed(() => {
    const total = this.lessons().length;
    if (total === 0) return 0;
    return Math.round((this.completedCount() / total) * 100);
  });

  videoUrl = computed<SafeResourceUrl | null>(() => {
    const lesson = this.currentLesson();
    if (!lesson) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${lesson.videoId}?rel=0`
    );
  });

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private lessonService: LessonService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      const courseId = params.get('courseId');
      const lessonId = params.get('lessonId');
      if (!courseId || !lessonId) return;

      this.lessonId.set(lessonId);

      if (this.courseId() !== courseId) {
        this.courseId.set(courseId);
        this.loadCourseAndLessons(courseId);
      }
    });
  }

  private loadCourseAndLessons(courseId: string): void {
    this.loading.set(true);
    this.error.set('');

    this.courseService.getById(courseId).subscribe({
      next: (course) => this.course.set(course),
      error: (err) => {
        this.error.set('Erro ao carregar curso.');
        console.error(err);
      },
    });

    this.lessonService.listByCourse(courseId).subscribe({
      next: (lessons) => {
        this.lessons.set([...lessons].sort((a, b) => a.order - b.order));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar aulas.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  goToLesson(lesson: Lesson): void {
    this.router.navigate(['/courses', this.courseId(), 'lessons', lesson.id]);
  }

  goToPrevious(): void {
    const lesson = this.previousLesson();
    if (lesson) this.goToLesson(lesson);
  }

  goToNext(): void {
    const lesson = this.nextLesson();
    if (lesson) this.goToLesson(lesson);
  }

  toggleComplete(): void {
    const lesson = this.currentLesson();
    const courseId = this.courseId();
    if (!lesson || !courseId || this.updatingCompletion()) return;

    this.updatingCompletion.set(true);
    const request$ = lesson.completed
      ? this.lessonService.uncomplete(courseId, lesson.id)
      : this.lessonService.complete(courseId, lesson.id);

    request$.subscribe({
      next: (updated) => {
        this.lessons.update((list) =>
          list.map((item) => (item.id === updated.id ? updated : item))
        );
        this.updatingCompletion.set(false);
      },
      error: (err) => {
        this.updatingCompletion.set(false);
        console.error(err);
      },
    });
  }
}
