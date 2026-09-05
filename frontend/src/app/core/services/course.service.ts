import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course } from '../models/course.model';

export interface Video {
  id: string;
  courseId: string;
  tenantId: string;
  title: string;
  youtubeVideoId: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  private apiUrl = 'http://localhost:3000/api/courses';
  private headers = new HttpHeaders({ 'x-tenant-id': 'tenant-1' });

  constructor(private http: HttpClient) {}

  list(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl, { headers: this.headers });
  }

  getById(id: string): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`, { headers: this.headers });
  }

  create(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'tenantId'>): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, course, { headers: this.headers });
  }

  update(id: string, course: Partial<Course>): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/${id}`, course, { headers: this.headers });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.headers });
  }

  getVideosByCourse(courseId: string): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.apiUrl}/${courseId}/videos`, { headers: this.headers });
  }
}