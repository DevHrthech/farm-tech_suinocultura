import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest, RegisterRequest, LoginResponse, User } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  currentUser = signal<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  private getActiveStorage(): Storage {
    return localStorage.getItem('auth_token') ? localStorage : sessionStorage;
  }

  private saveSession(response: LoginResponse, rememberMe: boolean): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    otherStorage.removeItem('auth_token');
    otherStorage.removeItem('auth_user');

    storage.setItem('auth_token', response.token);
    storage.setItem('auth_user', JSON.stringify(response.user));
    this.currentUser.set(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  login(credentials: LoginRequest, rememberMe: boolean = true): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => this.saveSession(response, rememberMe))
    );
  }

  register(data: RegisterRequest, rememberMe: boolean = true): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((response) => this.saveSession(response, rememberMe))
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    this.currentUser.set(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  updateCurrentUser(user: User): void {
    this.getActiveStorage().setItem('auth_user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token') ?? sessionStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private restoreSession(): void {
    const token = this.getToken();
    const userJson = localStorage.getItem('auth_user') ?? sessionStorage.getItem('auth_user');

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        this.currentUser.set(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error);
        this.logout();
      }
    }
  }
}
