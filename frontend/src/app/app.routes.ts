import { Routes } from '@angular/router';
import { CourseList } from './features/courses/course-list/course-list';
import { CourseForm } from './features/courses/course-form/course-form';
import { CourseDetail } from './features/courses/course-detail/course-detail';
import { LessonForm } from './features/courses/lesson-form/lesson-form';

export const routes: Routes = [
  { path: '', component: CourseList },
  { path: 'courses', component: CourseList },
  { path: 'courses/new', component: CourseForm },
  { path: 'courses/:id', component: CourseDetail },
  { path: 'courses/:id/edit', component: CourseForm },
  { path: 'courses/:courseId/lessons/new', component: LessonForm },
  { path: '**', redirectTo: '' }
];