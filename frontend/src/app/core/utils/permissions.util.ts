import { User } from '../models/auth.model';

export function canAuthor(user: User | null | undefined): boolean {
  return user?.role === 'instrutor' || user?.role === 'admin';
}

export function canManageCourse(
  user: User | null | undefined,
  authorId: string | null | undefined
): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.id === authorId;
}
