import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService, Course } from '../../services/course';

@Component({
  imports: [CommonModule],
  selector: 'app-course-list',
  styleUrl: './course-list.css',
  templateUrl: './course-list.html',
})
export class CourseList implements OnInit {
  courses: Course[] = [];
  loading = false;
  error: string | null = null;

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.error = null;
    this.courseService.getCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erro ao carregar cursos';
        this.loading = false;
        console.error(err);
      }
    });
  }

  deleteCourse(id: string): void {
    if (confirm('Tem certeza que deseja deletar este curso?')) {
      this.courseService.deleteCourse(id).subscribe({
        next: () => {
          this.courses = this.courses.filter(c => c.id !== id);
        },
        error: (err) => {
          this.error = 'Erro ao deletar curso';
          console.error(err);
        }
      });
    }
  }
}
