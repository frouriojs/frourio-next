import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import React from 'react';
import useSWR, { SWRConfig } from 'swr';
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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
);

describe('useSWR with $fc.$build', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('should fetch data using $fc.$build arguments', async () => {
    const query = { aa: 'test-aa' };
    const buildArgs = $fc.$build({ headers: {}, query });

    const { result } = renderHook(() => useSWR(...buildArgs), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeUndefined();
  });

  test('should not fetch data when build args are null', async () => {
    const buildArgs = $fc.$build(null);

    const { result } = renderHook(() => useSWR(...buildArgs), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isValidating).toBe(false);
  });

  test('should handle fetch error', async () => {
    const query = { aa: 'test-aa-error' };
    const buildArgs = $fc.$build({ headers: {}, query });

    const { result } = renderHook(() => useSWR(...buildArgs), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(Error);
  });

  test('should fetch data using global fetcher from SWRConfig', async () => {
    const query = { aa: 'test-aa-global' };
    const [key] = $fc.$build({ headers: {}, query });

    const globalWrapper = ({ children }: { children: React.ReactNode }) => (
      <SWRConfig value={{ provider: () => new Map(), fetcher: $fc.$get }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useSWR(key), { wrapper: globalWrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeUndefined();
  });
});

describe('useSWR with apiClient.$build (fc.$build)', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('should fetch data using apiClient.$build arguments', async () => {
    const query = { aa: 'test-aa-apiClient' };
    const buildArgs = apiClient.$build({ headers: {}, query });

    const { result } = renderHook(() => useSWR(...buildArgs), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeUndefined();
  });

  test('should not fetch data when build args are null', async () => {
    const buildArgs = apiClient.$build(null);

    const { result } = renderHook(() => useSWR(...buildArgs), { wrapper });

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isValidating).toBe(false);
  });

   test('should handle fetch error with apiClient', async () => {
    const query = { aa: 'test-aa-apiClient-error' };
    const buildArgs = apiClient.$build({ headers: {}, query });

    const { result } = renderHook(() => useSWR(...buildArgs), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(Error);
  });

  test('should fetch data using global fetcher with apiClient', async () => {
    const query = { aa: 'test-aa-apiClient-global' };
    const [key] = apiClient.$build({ headers: {}, query });

     const globalWrapper = ({ children }: { children: React.ReactNode }) => (
      <SWRConfig value={{ provider: () => new Map(), fetcher: apiClient.$get }}>
        {children}
      </SWRConfig>
    );

    const { result } = renderHook(() => useSWR(key), { wrapper: globalWrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeUndefined();
  });
});
