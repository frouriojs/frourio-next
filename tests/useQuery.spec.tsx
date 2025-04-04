import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { $fc as base$Fc } from '../projects/basic/app/frourio.client';
import { apiClient } from '../projects/basic/lib/apiClient';

const mockData = { bb: 'test-bb' };

const $fc = base$Fc({ baseURL: 'http://localhost' });

const handlers = [
  http.get('http://localhost/', ({ request }) => {
    const url = new URL(request.url);
    const aa = url.searchParams.get('aa');

    if (aa === 'test-aa-error') {
      return new HttpResponse(null, { status: 500 });
    }
    if (aa) {
      return HttpResponse.json(mockData);
    }
    return new HttpResponse('Missing query parameter: aa', { status: 400 });
  }),
  http.get('http://example.com/', ({ request }) => {
    const url = new URL(request.url);
    const aa = url.searchParams.get('aa');

    if (aa === 'test-aa-apiClient-error') {
      return new HttpResponse(null, { status: 500 });
    }
    if (aa) {
      return HttpResponse.json(mockData);
    }
    return new HttpResponse('Missing query parameter: aa', { status: 400 });
  }),
];

const server = setupServer(...handlers);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useQuery with $fc.$build', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
  });
  afterAll(() => server.close());

  test('should fetch data using $fc.$build arguments', async () => {
    const query = { aa: 'test-aa' };
    const [queryKey, queryFn] = $fc.$build({ headers: {}, query });
    const wrapper = createWrapper();

    const { result } = renderHook(() => useQuery({ queryKey: [queryKey], queryFn }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  test('should not fetch data when build args are null', async () => {
    const [queryKey, queryFn] = $fc.$build(null);
    const wrapper = createWrapper();

    const { result } = renderHook(
      () => useQuery({ queryKey: [queryKey], queryFn, enabled: !!queryKey }),
      { wrapper }
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.status).toBe('pending');
  });

  test('should handle fetch error', async () => {
    const query = { aa: 'test-aa-error' };
    const [queryKey, queryFn] = $fc.$build({ headers: {}, query });
    const wrapper = createWrapper();

    const { result } = renderHook(() => useQuery({ queryKey: [queryKey], queryFn }), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useQuery with apiClient.$build (fc.$build)', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
  });
  afterAll(() => server.close());

  test('should fetch data using apiClient.$build arguments', async () => {
    const query = { aa: 'test-aa-apiClient' };
    const [queryKey, queryFn] = apiClient.$build({ headers: {}, query });
    const wrapper = createWrapper();

    const { result } = renderHook(() => useQuery({ queryKey: [queryKey], queryFn }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  test('should not fetch data when build args are null', async () => {
    const [queryKey, queryFn] = apiClient.$build(null);
    const wrapper = createWrapper();

    const { result } = renderHook(
      () => useQuery({ queryKey: [queryKey], queryFn, enabled: !!queryKey }),
      { wrapper }
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
    expect(result.current.status).toBe('pending');
  });

   test('should handle fetch error with apiClient', async () => {
    const query = { aa: 'test-aa-apiClient-error' };
    const [queryKey, queryFn] = apiClient.$build({ headers: {}, query });
    const wrapper = createWrapper();

    const { result } = renderHook(() => useQuery({ queryKey: [queryKey], queryFn }), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(Error);
  });
});