import { apiGet, apiPost } from './client';
import type { StandupEntry } from '../types';

export const standupApi = {
  listByIteration: (projectId: string, iterationId: string) =>
    apiGet<StandupEntry[]>(`/projects/${projectId}/standup?iterationId=${iterationId}`),

  create: (projectId: string, data: Partial<StandupEntry>) =>
    apiPost<StandupEntry>(`/projects/${projectId}/standup`, data),
};
