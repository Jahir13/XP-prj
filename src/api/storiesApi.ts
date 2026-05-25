import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type { Story } from '../types';

export const storiesApi = {
  list: (projectId: string) => apiGet<Story[]>(`/projects/${projectId}/stories`),

  getById: (projectId: string, id: string) => apiGet<Story>(`/projects/${projectId}/stories/${id}`),

  create: (projectId: string, data: Partial<Story>) => apiPost<Story>(`/projects/${projectId}/stories`, data),

  update: (projectId: string, id: string, data: Partial<Story>) =>
    apiPut<Story>(`/projects/${projectId}/stories/${id}`, data),

  delete: (projectId: string, id: string) => apiDelete<void>(`/projects/${projectId}/stories/${id}`),

  split: (projectId: string, id: string, newStories: Partial<Story>[]) =>
    apiPost<Story[]>(`/projects/${projectId}/stories/${id}/split`, { newStories }),

  reEstimate: (projectId: string, id: string, points: number) =>
    apiPut<Story>(`/projects/${projectId}/stories/${id}/estimate`, { points }),

  accept: (projectId: string, id: string) => apiPut<Story>(`/projects/${projectId}/stories/${id}/accept`),

  prioritize: (projectId: string, id: string, order: number) =>
    apiPut<Story>(`/projects/${projectId}/stories/${id}/prioritize`, { order }),
};
