import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type { Project, ProjectMember } from '../types';

export const projectsApi = {
  list: () => apiGet<Project[]>('/projects'),

  getById: (id: string) => apiGet<Project>(`/projects/${id}`),

  create: (data: Partial<Project>) => apiPost<Project>('/projects', data),

  update: (id: string, data: Partial<Project>) => apiPut<Project>(`/projects/${id}`, data),

  delete: (id: string) => apiDelete<void>(`/projects/${id}`),

  members: (id: string) => apiGet<ProjectMember[]>(`/projects/${id}/members`),

  roles: (id: string) => apiGet<ProjectMember[]>(`/projects/${id}/roles`),
};
