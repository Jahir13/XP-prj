import type { ApiError, ApiResponse } from '../types';

let baseUrl = 'http://localhost:3000/api';

export function setBaseUrl(url: string) {
  baseUrl = url;
}

export function getBaseUrl(): string {
  return baseUrl;
}

export class ApiClientError extends Error {
  public status: number;
  public code: string;
  public details?: Record<string, string[]>;

  constructor(err: ApiError) {
    super(err.message);
    this.name = 'ApiClientError';
    this.status = err.status;
    this.code = err.code;
    this.details = err.details;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let body: ApiError;
    try {
      body = await response.json();
    } catch {
      body = { status: response.status, code: 'UNKNOWN', message: response.statusText };
    }
    throw new ApiClientError(body);
  }
  const json: ApiResponse<T> = await response.json();
  return json.data;
}

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
};

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${baseUrl}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), { headers: defaultHeaders });
  return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: defaultHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'PUT',
    headers: defaultHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'PATCH',
    headers: defaultHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'DELETE',
    headers: defaultHeaders,
  });
  return handleResponse<T>(res);
}
