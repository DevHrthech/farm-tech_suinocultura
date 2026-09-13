export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nomeCompleto: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    nomeCompleto: string;
    email: string;
    role: string;
  };
}

export interface User {
  id: string;
  nomeCompleto: string;
  email: string;
  role: string;
}
