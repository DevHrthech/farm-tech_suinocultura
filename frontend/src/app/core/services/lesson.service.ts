import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lesson } from '../models/lesson.model';

@Injectable({ providedIn: 'root' })
export class LessonService {
  private apiUrl = 'http://localhost:3000/api/courses';

  constructor(private http: HttpClient) {}

  listByCourse(courseId: string): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${this.apiUrl}/${courseId}/lessons`);
  }

  getById(courseId: string, id: string): Observable<Lesson> {
    return this.http.get<Lesson>(`${this.apiUrl}/${courseId}/lessons/${id}`);
  }

  create(
    courseId: string,
    lesson: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt' | 'tenantId' | 'courseId' | 'completed'>
  ): Observable<Lesson> {
    return this.http.post<Lesson>(
      `${this.apiUrl}/${courseId}/lessons`,
      lesson
    );
  }

  update(
    courseId: string,
    id: string,
    lesson: Partial<Lesson>
  ): Observable<Lesson> {
    return this.http.put<Lesson>(
      `${this.apiUrl}/${courseId}/lessons/${id}`,
      lesson
    );
  }

  delete(courseId: string, id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${courseId}/lessons/${id}`
    );
  }

  complete(courseId: string, id: string): Observable<Lesson> {
    return this.http.post<Lesson>(
      `${this.apiUrl}/${courseId}/lessons/${id}/complete`,
      {}
    );
  }

  uncomplete(courseId: string, id: string): Observable<Lesson> {
    return this.http.delete<Lesson>(
      `${this.apiUrl}/${courseId}/lessons/${id}/complete`
    );
  }
}
