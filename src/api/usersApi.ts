import { apiGet, apiPut } from './client';
import type { User } from '../types';

export const usersApi = {
  profile: () => apiGet<User>('/users/profile'),

  updateProfile: (data: Partial<User>) => apiPut<User>('/users/profile', data),

  teamMembers: (projectId: string) => apiGet<User[]>(`/projects/${projectId}/team`),

  roleAssignments: (projectId: string) => apiGet<User[]>(`/projects/${projectId}/roles`),
};
