import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuizQuestion, QuizAttempt } from '../models/quiz.model';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private apiUrl = 'http://localhost:3000/api/courses';

  constructor(private http: HttpClient) {}

  listQuestions(courseId: string): Observable<QuizQuestion[]> {
    return this.http.get<QuizQuestion[]>(`${this.apiUrl}/${courseId}/quiz/questions`);
  }

  createQuestion(
    courseId: string,
    data: Omit<QuizQuestion, 'id' | 'courseId' | 'tenantId' | 'createdAt' | 'updatedAt'>
  ): Observable<QuizQuestion> {
    return this.http.post<QuizQuestion>(`${this.apiUrl}/${courseId}/quiz/questions`, data);
  }

  updateQuestion(
    courseId: string,
    id: string,
    data: Partial<QuizQuestion>
  ): Observable<QuizQuestion> {
    return this.http.put<QuizQuestion>(`${this.apiUrl}/${courseId}/quiz/questions/${id}`, data);
  }

  deleteQuestion(courseId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${courseId}/quiz/questions/${id}`);
  }

  getLastAttempt(courseId: string): Observable<QuizAttempt | null> {
    return this.http.get<QuizAttempt | null>(`${this.apiUrl}/${courseId}/quiz/attempts/last`);
  }

  submitAttempt(courseId: string, score: number, total: number): Observable<QuizAttempt> {
    return this.http.post<QuizAttempt>(`${this.apiUrl}/${courseId}/quiz/attempts`, {
      score,
      total,
    });
  }
}
