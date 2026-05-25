import { apiGet, apiPost } from './client';
import type { RetroEntry } from '../types';

export const retroApi = {
  listByIteration: (projectId: string, iterationId: string) =>
    apiGet<RetroEntry[]>(`/projects/${projectId}/retrospective/${iterationId}`),

  create: (projectId: string, iterationId: string, data: Partial<RetroEntry>) =>
    apiPost<RetroEntry>(`/projects/${projectId}/retrospective/${iterationId}`, data),
};
