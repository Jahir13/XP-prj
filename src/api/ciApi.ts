import { apiGet, apiPost } from './client';
import type { BuildEvent, PipelineHistory } from '../types';

export const ciApi = {
  list: (projectId: string) => apiGet<BuildEvent[]>(`/projects/${projectId}/ci`),

  getById: (projectId: string, id: string) => apiGet<BuildEvent>(`/projects/${projectId}/ci/${id}`),

  triggerBuild: (projectId: string, branch: string) =>
    apiPost<BuildEvent>(`/projects/${projectId}/ci/trigger`, { branch }),

  pipelineHistory: (projectId: string) => apiGet<PipelineHistory>(`/projects/${projectId}/ci/pipeline-history`),

  integrationFrequency: (projectId: string) =>
    apiGet<{ frequency: number }>(`/projects/${projectId}/ci/integration-frequency`),
};
