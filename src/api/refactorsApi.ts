import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type { RefactorLog, DebtRegister } from '../types';

export const refactorsApi = {
  list: (projectId: string) => apiGet<RefactorLog[]>(`/projects/${projectId}/refactors`),

  getById: (projectId: string, id: string) => apiGet<RefactorLog>(`/projects/${projectId}/refactors/${id}`),

  create: (projectId: string, data: Partial<RefactorLog>) =>
    apiPost<RefactorLog>(`/projects/${projectId}/refactors`, data),

  update: (projectId: string, id: string, data: Partial<RefactorLog>) =>
    apiPut<RefactorLog>(`/projects/${projectId}/refactors/${id}`, data),

  delete: (projectId: string, id: string) => apiDelete<void>(`/projects/${projectId}/refactors/${id}`),

  debtRegister: (projectId: string) => apiGet<DebtRegister>(`/projects/${projectId}/refactors/debt-register`),

  healthScore: (projectId: string) => apiGet<{ score: number }>(`/projects/${projectId}/refactors/health-score`),
};
