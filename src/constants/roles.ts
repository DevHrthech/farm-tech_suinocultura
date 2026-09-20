export const ROLES = ["aluno", "instrutor", "admin"] as const;
export type Role = (typeof ROLES)[number];
