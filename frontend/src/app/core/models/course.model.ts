export interface Course {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  category: string;
  authorId: string;
  coverImageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}