import { Routes } from '@angular/router';
import { CourseList } from './features/courses/course-list/course-list';
import { CourseForm } from './features/courses/course-form/course-form';
import { CourseDetail } from './features/courses/course-detail/course-detail';
import { LessonForm } from './features/courses/lesson-form/lesson-form';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: CourseList, canActivate: [authGuard] },
  { path: 'courses', component: CourseList, canActivate: [authGuard] },
  { path: 'courses/new', component: CourseForm, canActivate: [authGuard] },
  { path: 'courses/:id', component: CourseDetail, canActivate: [authGuard] },
  { path: 'courses/:id/edit', component: CourseForm, canActivate: [authGuard] },
  { path: 'courses/:courseId/lessons/new', component: LessonForm, canActivate: [authGuard] },
  { path: 'courses/:courseId/lessons/:lessonId/edit', component: LessonForm, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];