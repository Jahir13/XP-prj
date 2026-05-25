import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type { TestResult, CoverageSnapshot } from '../types';

export const testsApi = {
  list: (projectId: string) => apiGet<TestResult[]>(`/projects/${projectId}/tests`),

  create: (projectId: string, data: Partial<TestResult>) => apiPost<TestResult>(`/projects/${projectId}/tests`, data),

  update: (projectId: string, id: string, data: Partial<TestResult>) =>
    apiPut<TestResult>(`/projects/${projectId}/tests/${id}`, data),

  delete: (projectId: string, id: string) => apiDelete<void>(`/projects/${projectId}/tests/${id}`),

  acceptanceTests: (projectId: string, storyId: string) =>
    apiGet<TestResult[]>(`/projects/${projectId}/stories/${storyId}/acceptance-tests`),

  coverage: (projectId: string) => apiGet<CoverageSnapshot>(`/projects/${projectId}/tests/coverage`),
};
