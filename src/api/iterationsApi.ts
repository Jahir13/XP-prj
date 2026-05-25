import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type { Iteration, BurndownPoint } from '../types';

export const iterationsApi = {
  list: (projectId: string) => apiGet<Iteration[]>(`/projects/${projectId}/iterations`),

  getById: (projectId: string, id: string) => apiGet<Iteration>(`/projects/${projectId}/iterations/${id}`),

  create: (projectId: string, data: Partial<Iteration>) =>
    apiPost<Iteration>(`/projects/${projectId}/iterations`, data),

  update: (projectId: string, id: string, data: Partial<Iteration>) =>
    apiPut<Iteration>(`/projects/${projectId}/iterations/${id}`, data),

  delete: (projectId: string, id: string) => apiDelete<void>(`/projects/${projectId}/iterations/${id}`),

  velocity: (projectId: string, id: string) =>
    apiGet<{ velocity: number }>(`/projects/${projectId}/iterations/${id}/velocity`),

  burndown: (projectId: string, id: string) =>
    apiGet<BurndownPoint[]>(`/projects/${projectId}/iterations/${id}/burndown`),
};
