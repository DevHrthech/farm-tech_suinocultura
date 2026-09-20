export interface InstructorRequest {
  id: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    nomeCompleto: string;
    email: string;
  };
}
