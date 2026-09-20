export interface Profile {
  id: string;
  nomeCompleto: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface UpdateProfileRequest {
  nomeCompleto: string;
  avatarUrl: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
