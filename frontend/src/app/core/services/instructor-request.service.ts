import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InstructorRequest } from '../models/instructor-request.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InstructorRequestService {
  private apiUrl = `${environment.apiUrl}/api/instructor-requests`;

  constructor(private http: HttpClient) {}

  getMine(): Observable<InstructorRequest | null> {
    return this.http.get<InstructorRequest | null>(`${this.apiUrl}/me`);
  }

  create(): Observable<InstructorRequest> {
    return this.http.post<InstructorRequest>(this.apiUrl, {});
  }

  list(): Observable<InstructorRequest[]> {
    return this.http.get<InstructorRequest[]>(this.apiUrl);
  }

  approve(id: string): Observable<InstructorRequest> {
    return this.http.put<InstructorRequest>(`${this.apiUrl}/${id}/approve`, {});
  }

  reject(id: string): Observable<InstructorRequest> {
    return this.http.put<InstructorRequest>(`${this.apiUrl}/${id}/reject`, {});
  }
}
