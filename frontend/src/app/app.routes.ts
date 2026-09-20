import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { CourseList } from './features/courses/course-list/course-list';
import { CourseForm } from './features/courses/course-form/course-form';
import { CourseDetail } from './features/courses/course-detail/course-detail';
import { LessonForm } from './features/courses/lesson-form/lesson-form';
import { LessonPlayer } from './features/courses/lesson-player/lesson-player';
import { QuizCourseList } from './features/quiz/quiz-course-list/quiz-course-list';
import { QuizList } from './features/quiz/quiz-list/quiz-list';
import { QuizForm } from './features/quiz/quiz-form/quiz-form';
import { QuizPlayer } from './features/quiz/quiz-player/quiz-player';
import { QuizManage } from './features/quiz/quiz-manage/quiz-manage';
import { QuizQuestionForm } from './features/quiz/quiz-question-form/quiz-question-form';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { ProfileComponent } from './features/profile/profile';
import { UserManagement } from './features/admin/user-management/user-management';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

const instructorGuard = roleGuard(['instrutor', 'admin']);
const adminGuard = roleGuard(['admin']);

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: Dashboard, canActivate: [authGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'admin/users', component: UserManagement, canActivate: [authGuard, adminGuard] },
  { path: 'courses', component: CourseList, canActivate: [authGuard] },
  { path: 'courses/new', component: CourseForm, canActivate: [authGuard, instructorGuard] },
  { path: 'quizzes', component: QuizCourseList, canActivate: [authGuard] },
  { path: 'quiz-builder/new', component: QuizForm, canActivate: [authGuard, instructorGuard] },
  { path: 'courses/:id', component: CourseDetail, canActivate: [authGuard] },
  { path: 'courses/:id/edit', component: CourseForm, canActivate: [authGuard, instructorGuard] },
  { path: 'courses/:courseId/lessons/new', component: LessonForm, canActivate: [authGuard, instructorGuard] },
  { path: 'courses/:courseId/lessons/:lessonId/edit', component: LessonForm, canActivate: [authGuard, instructorGuard] },
  { path: 'courses/:courseId/lessons/:lessonId', component: LessonPlayer, canActivate: [authGuard] },
  { path: 'courses/:courseId/quiz', component: QuizList, canActivate: [authGuard] },
  { path: 'courses/:courseId/quiz/:quizId/edit', component: QuizForm, canActivate: [authGuard, instructorGuard] },
  { path: 'courses/:courseId/quiz/:quizId/play', component: QuizPlayer, canActivate: [authGuard] },
  { path: 'courses/:courseId/quiz/:quizId/questions', component: QuizManage, canActivate: [authGuard, instructorGuard] },
  { path: 'courses/:courseId/quiz/:quizId/questions/new', component: QuizQuestionForm, canActivate: [authGuard, instructorGuard] },
  { path: 'courses/:courseId/quiz/:quizId/questions/:questionId/edit', component: QuizQuestionForm, canActivate: [authGuard, instructorGuard] },
  { path: '**', redirectTo: 'login' }
];
