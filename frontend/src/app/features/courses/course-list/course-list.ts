import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CourseService, Video } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';

interface CourseWithVideos extends Course {
  videos: Video[];
}

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatProgressSpinnerModule, MatCardModule],
  templateUrl: './course-list.html',
  styleUrl: './course-list.css'
})
export class CourseList implements OnInit {
  courses = signal<CourseWithVideos[]>([]);
  loading = signal(true);
  error = signal('');

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.courseService.list().subscribe({
      next: (data) => {
        data.forEach(course => {
          this.courseService.getVideosByCourse(course.id).subscribe({
            next: (videos) => {
              const courseWithVideos: CourseWithVideos = { ...course, videos };
              this.courses.update(courses => {
                const index = courses.findIndex(c => c.id === course.id);
                if (index >= 0) {
                  courses[index] = courseWithVideos;
                } else {
                  courses.push(courseWithVideos);
                }
                return [...courses];
              });
            },
            error: (err) => {
              console.error(`Erro ao carregar vídeos do curso ${course.id}:`, err);
            }
          });
        });
        this.courses.set(data.map(c => ({ ...c, videos: [] })));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar cursos. Verifique se o backend está rodando.');
        this.loading.set(false);
        console.error(err);
      }
    });
  }
}