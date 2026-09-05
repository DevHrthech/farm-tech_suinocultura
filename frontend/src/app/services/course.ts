import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Course {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  category: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = 'http://localhost:3000/api/courses';
  private tenantId = 'tenant-1';

  constructor(private http: HttpClient) {}

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl, {
      headers: { 'x-tenant-id': this.tenantId }
    });
  }

  getCourse(id: string): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`, {
      headers: { 'x-tenant-id': this.tenantId }
    });
  }

  createCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, course, {
      headers: { 'x-tenant-id': this.tenantId }
    });
  }

  updateCourse(id: string, course: Partial<Course>): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/${id}`, course, {
      headers: { 'x-tenant-id': this.tenantId }
    });
  }

  deleteCourse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: { 'x-tenant-id': this.tenantId }
    });
  }
}
