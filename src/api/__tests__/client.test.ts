import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiGet, apiPost, setBaseUrl, getBaseUrl, ApiClientError } from '../client';

describe('API Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    setBaseUrl('http://localhost:3000/api');
  });

  it('manages base URL', () => {
    expect(getBaseUrl()).toBe('http://localhost:3000/api');
    setBaseUrl('http://other-domain:4000/api');
    expect(getBaseUrl()).toBe('http://other-domain:4000/api');
  });

  it('performs standard apiGet request successfully', async () => {
    const mockData = { id: '1', name: 'Story 1' };
    const globalFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockData }),
    } as Response);
    vi.stubGlobal('fetch', globalFetch);

    const result = await apiGet('/stories');
    expect(result).toEqual(mockData);
    expect(globalFetch).toHaveBeenCalledWith('http://localhost:3000/api/stories', expect.any(Object));
  });

  it('performs apiPost request successfully', async () => {
    const payload = { title: 'New Story' };
    const mockResponse = { id: '2', title: 'New Story' };
    const globalFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockResponse }),
    } as Response);
    vi.stubGlobal('fetch', globalFetch);

    const result = await apiPost('/stories', payload);
    expect(result).toEqual(mockResponse);
    expect(globalFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/stories',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    );
  });

  it('handles ApiError correctly and throws ApiClientError', async () => {
    const errorBody = {
      status: 400,
      code: 'BAD_REQUEST',
      message: 'Invalid details',
    };
    const globalFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => errorBody,
    } as Response);
    vi.stubGlobal('fetch', globalFetch);

    await expect(apiGet('/stories')).rejects.toThrow(ApiClientError);
  });
});
