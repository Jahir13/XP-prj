import { apiGet, apiPost, apiPut } from './client';
import type { PairSession, PairRotationSuggestion } from '../types';

export const pairsApi = {
  list: (projectId: string) => apiGet<PairSession[]>(`/projects/${projectId}/pairs`),

  getById: (projectId: string, id: string) => apiGet<PairSession>(`/projects/${projectId}/pairs/${id}`),

  create: (projectId: string, data: Partial<PairSession>) => apiPost<PairSession>(`/projects/${projectId}/pairs`, data),

  endSession: (projectId: string, id: string) => apiPut<PairSession>(`/projects/${projectId}/pairs/${id}/end`),

  history: (projectId: string) => apiGet<PairSession[]>(`/projects/${projectId}/pairs/history`),

  rotationSuggestions: (projectId: string) =>
    apiGet<PairRotationSuggestion[]>(`/projects/${projectId}/pairs/rotation-suggestions`),
};
