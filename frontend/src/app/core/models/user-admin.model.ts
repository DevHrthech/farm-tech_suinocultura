export const ROLES = ['aluno', 'instrutor', 'admin'] as const;

export interface AdminUser {
  id: string;
  nomeCompleto: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}
