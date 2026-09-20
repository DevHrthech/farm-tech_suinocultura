import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quiz, QuizSummary, QuizQuestion, QuizAttempt } from '../models/quiz.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private apiUrl = `${environment.apiUrl}/api/courses`;

  constructor(private http: HttpClient) {}

  getSummary(courseId: string): Observable<QuizSummary> {
    return this.http.get<QuizSummary>(`${this.apiUrl}/${courseId}/quiz/summary`);
  }

  listQuizzes(courseId: string): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.apiUrl}/${courseId}/quiz/quizzes`);
  }

  getQuiz(courseId: string, quizId: string): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/${courseId}/quiz/quizzes/${quizId}`);
  }

  createQuiz(
    courseId: string,
    data: { title: string; description?: string | null }
  ): Observable<Quiz> {
    return this.http.post<Quiz>(`${this.apiUrl}/${courseId}/quiz/quizzes`, data);
  }

  updateQuiz(
    courseId: string,
    quizId: string,
    data: { title?: string; description?: string | null }
  ): Observable<Quiz> {
    return this.http.put<Quiz>(`${this.apiUrl}/${courseId}/quiz/quizzes/${quizId}`, data);
  }

  deleteQuiz(courseId: string, quizId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${courseId}/quiz/quizzes/${quizId}`);
  }

  listQuestions(courseId: string, quizId: string): Observable<QuizQuestion[]> {
    return this.http.get<QuizQuestion[]>(`${this.apiUrl}/${courseId}/quiz/quizzes/${quizId}/questions`);
  }

  createQuestion(
    courseId: string,
    quizId: string,
    data: Omit<QuizQuestion, 'id' | 'courseId' | 'quizId' | 'tenantId' | 'createdAt' | 'updatedAt'>
  ): Observable<QuizQuestion> {
    return this.http.post<QuizQuestion>(`${this.apiUrl}/${courseId}/quiz/quizzes/${quizId}/questions`, data);
  }

  updateQuestion(
    courseId: string,
    quizId: string,
    id: string,
    data: Partial<QuizQuestion>
  ): Observable<QuizQuestion> {
    return this.http.put<QuizQuestion>(`${this.apiUrl}/${courseId}/quiz/quizzes/${quizId}/questions/${id}`, data);
  }

  deleteQuestion(courseId: string, quizId: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${courseId}/quiz/quizzes/${quizId}/questions/${id}`);
  }

  getLastAttempt(courseId: string, quizId: string): Observable<QuizAttempt | null> {
    return this.http.get<QuizAttempt | null>(`${this.apiUrl}/${courseId}/quiz/quizzes/${quizId}/attempts/last`);
  }

  submitAttempt(courseId: string, quizId: string, score: number, total: number): Observable<QuizAttempt> {
    return this.http.post<QuizAttempt>(`${this.apiUrl}/${courseId}/quiz/quizzes/${quizId}/attempts`, {
      score,
      total,
    });
  }
}
