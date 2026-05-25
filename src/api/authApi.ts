import { apiPost, apiGet } from './client';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

export const authApi = {
  login: (data: LoginRequest) => apiPost<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) => apiPost<AuthResponse>('/auth/register', data),

  logout: () => apiPost<void>('/auth/logout'),

  refreshToken: (refreshToken: string) => apiPost<AuthResponse>('/auth/refresh', { refreshToken }),

  me: () => apiGet<User>('/auth/me'),
};
