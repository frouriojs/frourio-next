import { http, HttpResponse, passthrough } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { User } from '../projects/basic/app/api/test-client/frourio'; // Import type for assertions
// Correctly import the client type for Post body
import type { z } from 'zod';
import { ZodError } from 'zod';
import type { frourioSpec as testClientSpec } from '../projects/basic/app/api/test-client/frourio';
import { $fc as base$Fc, fc as baseFc } from '../projects/basic/app/frourio.client'; // Root client

// --- MSW Setup ---
// Simple in-memory store for PUT/DELETE tests
const usersDb = new Map<number, User>([
  [1, { id: 1, name: 'Alice', isAdmin: true }],
  [2, { id: 2, name: 'Bob', isAdmin: false }],
]);
const handlers = [
  // GET /api/test-client
  http.get('http://localhost/api/test-client', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const limit = url.searchParams.get('limit');

    if (search === 'error') {
      return HttpResponse.json({ message: 'Invalid search query' }, { status: 400 });
    }
    if (search === 'invalid-response') {
      // Return data that violates the schema type
      return HttpResponse.json([{ id: 'not-a-number', name: 'Alice' }]);
    }

    const users: User[] = [
      { id: 1, name: 'Alice', isAdmin: true },
      { id: 2, name: 'Bob' },
    ];

    const filteredUsers = search
      ? users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
      : users;

    const limitedUsers = limit ? filteredUsers.slice(0, parseInt(limit, 10)) : filteredUsers;

    return HttpResponse.json(limitedUsers);
  }),

  // POST /api/test-client
  http.post('http://localhost/api/test-client', async ({ request }) => {
    try {
      const body = (await request.json()) as Record<string, unknown>; // Type assertion
      // Basic validation simulation
      if (typeof body !== 'object' || body === null || typeof body.name !== 'string') {
        return HttpResponse.json({ message: 'Invalid request structure' }, { status: 400 }); // General bad request
      }
      // Specific validation for 422
      if (body.name === '') {
        return HttpResponse.json(
          {
            error: 'Unprocessable Entity',
            issues: [{ path: ['name'], message: 'Name cannot be empty' }],
          },
          { status: 422 },
        );
      }
      if (body.name === 'error') {
        return HttpResponse.json(
          { message: 'Cannot create user with name error' },
          { status: 400 },
        );
      }

      const newUser: User = {
        id: Math.floor(Math.random() * 1000) + 3, // Generate random ID
        name: body.name,
        isAdmin: (body.isAdmin as boolean | undefined) ?? false, // Type assertion
      };
      return HttpResponse.json(newUser, { status: 201 });
    } catch (_) {
      return HttpResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
    }
  }),

  // PUT /api/test-client/:userId
  http.put('http://localhost/api/test-client/:userId', async ({ request, params }) => {
    const userId = parseInt(params.userId as string, 10);
    if (isNaN(userId)) {
      return HttpResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    // Simulate finding user
    const existingUser = usersDb.get(userId);
    if (!existingUser) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    try {
      const body = (await request.json()) as Partial<Pick<User, 'name' | 'isAdmin'>>;
      const updatedUser = { ...existingUser, ...body };
      usersDb.set(userId, updatedUser);
      return HttpResponse.json(updatedUser);
    } catch (_) {
      return HttpResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
    }
  }),

  // DELETE /api/test-client/:userId
  http.delete('http://localhost/api/test-client/:userId', ({ params }) => {
    const userId = parseInt(params.userId as string, 10);
    if (isNaN(userId)) {
      return HttpResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    if (!usersDb.has(userId)) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    }

    usersDb.delete(userId);
    return new HttpResponse(null, { status: 204 }); // No Content
  }),

  // PATCH /api/test-client (FormData)
  http.patch('http://localhost/api/test-client', async ({ request }) => {
    try {
      const formData = await request.formData();
      const userId = formData.get('userId');
      const avatar = formData.get('avatar');

      if (typeof userId !== 'string' || !userId) {
        return HttpResponse.json({ message: 'Missing userId' }, { status: 400 });
      }
      if (!(avatar instanceof File)) {
        return HttpResponse.json({ message: 'Missing or invalid avatar file' }, { status: 400 });
      }

      // Simulate processing
      return HttpResponse.json({
        message: `Avatar for user ${userId} uploaded successfully.`,
        fileName: avatar.name,
        size: avatar.size,
      });
    } catch (_) {
      return HttpResponse.json({ message: 'Invalid FormData' }, { status: 400 });
    }
  }),

  // POST /api/test-client/stream (Raw Response)
  http.post('http://localhost/api/test-client/stream', async ({ request }) => {
    try {
      const body = (await request.json()) as { prompt?: string };
      if (!body.prompt) {
        return new Response('Prompt is required', { status: 400 });
      }

      // Simulate a streaming response
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(`Streaming response for prompt: "${body.prompt}"\n`));
          await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate delay
          controller.enqueue(encoder.encode('Chunk 1\n'));
          await new Promise((resolve) => setTimeout(resolve, 50));
          controller.enqueue(encoder.encode('Chunk 2\n'));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    } catch (_) {
      return new Response('Invalid JSON body', { status: 400 });
    }
  }),

  // Fallback for unhandled requests (optional, helps debugging)
  http.all('*', ({ request }) => {
    console.warn(`[MSW] Unhandled request: ${request.method} ${request.url}`);
    return passthrough(); // Allow unhandled requests to pass through
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// --- Client Initialization ---
const baseURL = 'http://localhost'; // Use a consistent base URL for tests

// High-level client ($fc)
const apiClient = base$Fc({ baseURL });

// Low-level client (fc)
const lowLevelApiClient = baseFc({ baseURL });

// --- Test Suites ---
describe('Frourio Client Tests', () => {
  describe('$fc (High-Level Client)', () => {
    // GET tests
    it('GET /api/test-client - Success', async () => {
      const users = await apiClient['api/test-client'].$get({ query: {} });
      expect(users).toHaveLength(2);
      expect(users[0]).toEqual({ id: 1, name: 'Alice', isAdmin: true });
      expect(users[1]).toEqual({ id: 2, name: 'Bob' });
    });
    it('GET /api/test-client - Success with query parameters', async () => {
      const users = await apiClient['api/test-client'].$get({ query: { search: 'ali', limit: 1 } });
      expect(users).toHaveLength(1);
      expect(users[0]).toEqual({ id: 1, name: 'Alice', isAdmin: true });
    });
    it('GET /api/test-client - API Error (400)', async () => {
      await expect(
        apiClient['api/test-client'].$get({ query: { search: 'error' } }),
      ).rejects.toThrowError(/HTTP Error: 400/);
    });
    it('GET /api/test-client - Response Validation Error', async () => {
      // MSW returns { id: 'not-a-number' }, causing ZodError
      await expect(
        apiClient['api/test-client'].$get({ query: { search: 'invalid-response' } }),
      ).rejects.toThrowError(ZodError);
    });

    // POST tests
    it('POST /api/test-client - Success', async () => {
      const newUser = await apiClient['api/test-client'].$post({ body: { name: 'Charlie' } });
      expect(newUser.id).toBeGreaterThan(2);
      expect(newUser.name).toBe('Charlie');
      expect(newUser.isAdmin).toBe(false);
    });
    it('POST /api/test-client - Success with optional field', async () => {
      const newUser = await apiClient['api/test-client'].$post({
        body: { name: 'David', isAdmin: true },
      });
      expect(newUser.id).toBeGreaterThan(2);
      expect(newUser.name).toBe('David');
      expect(newUser.isAdmin).toBe(true);
    });
    it('POST /api/test-client - API Error (400)', async () => {
      await expect(
        apiClient['api/test-client'].$post({ body: { name: 'error' } }),
      ).rejects.toThrowError(/HTTP Error: 400/);
    });
    it('POST /api/test-client - Validation Error (422)', async () => {
      // Send body that passes client validation but triggers MSW 422
      await expect(apiClient['api/test-client'].$post({ body: { name: '' } })).rejects.toThrowError(
        /HTTP Error: 422/,
      );
    });
  });

  describe('fc (Low-Level Client)', () => {
    // GET tests
    it('GET /api/test-client - Success', async () => {
      const result = await lowLevelApiClient['api/test-client'].$get({ query: {} });
      expect(result.ok).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.data!.status).toBe(200);
      expect(Array.isArray(result.data!.body)).toBe(true);
      const body = result.data!.body as User[];
      expect(body).toHaveLength(2);
      expect(body[0]).toEqual({ id: 1, name: 'Alice', isAdmin: true });
      expect(body[1]).toEqual({ id: 2, name: 'Bob' });
      expect(result.failure).toBeUndefined();
      expect(result.reason).toBeUndefined();
      expect(result.raw).toBeInstanceOf(Response);
    });
    it('GET /api/test-client - Success with query parameters', async () => {
      const result = await lowLevelApiClient['api/test-client'].$get({
        query: { search: 'ali', limit: 1 },
      });
      expect(result.ok).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.data!.status).toBe(200);
      expect(Array.isArray(result.data!.body)).toBe(true);
      const body = result.data!.body as User[];
      expect(body).toHaveLength(1);
      expect(body[0]).toEqual({ id: 1, name: 'Alice', isAdmin: true });
      expect(result.failure).toBeUndefined();
      expect(result.reason).toBeUndefined();
      expect(result.raw).toBeInstanceOf(Response);
    });
    it('GET /api/test-client - API Error (400)', async () => {
      const result = await lowLevelApiClient['api/test-client'].$get({
        query: { search: 'error' },
      });
      expect(result.ok).toBe(false);
      expect(result.isValid).toBe(true); // 400 response schema is defined
      expect(result.failure!.status).toBe(400);
      if (result.failure?.status === 400) {
        expect(result.failure.body).toEqual({ message: 'Invalid search query' });
      } else {
        throw new Error('Expected failure status 400');
      }
      expect(result.data).toBeUndefined();
      expect(result.reason).toBeUndefined();
      expect(result.raw).toBeInstanceOf(Response);
      expect(result.raw!.status).toBe(400);
    });
    it('GET /api/test-client - Response Validation Error', async () => {
      // MSW returns { id: 'not-a-number' }, causing isValid: false
      const result = await lowLevelApiClient['api/test-client'].$get({
        query: { search: 'invalid-response' },
      });
      expect(result.ok).toBe(true); // Status code was 2xx
      expect(result.isValid).toBe(false); // Zod validation failed
      expect(result.reason!).toBeInstanceOf(ZodError);
      expect(result.data).toBeUndefined();
      expect(result.failure).toBeUndefined();
      expect(result.raw).toBeInstanceOf(Response); // Raw response is still available
      // Cannot re-read raw body after internal validation attempt
      // await expect(result.raw!.json()).resolves.toEqual([{ id: 'not-a-number', name: 'Alice' }]);
    });

    // POST tests
    it('POST /api/test-client - Success', async () => {
      const result = await lowLevelApiClient['api/test-client'].$post({
        body: { name: 'Charlie' },
      });
      expect(result.ok).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.data!.status).toBe(201);
      expect(result.data!.body.id).toBeGreaterThan(2);
      expect(result.data!.body.name).toBe('Charlie');
      expect(result.data!.body.isAdmin).toBe(false);
      expect(result.failure).toBeUndefined();
      expect(result.reason).toBeUndefined();
      expect(result.raw).toBeInstanceOf(Response);
    });
    it('POST /api/test-client - Success with optional field', async () => {
      const result = await lowLevelApiClient['api/test-client'].$post({
        body: { name: 'David', isAdmin: true },
      });
      expect(result.ok).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.data!.status).toBe(201);
      expect(result.data!.body.id).toBeGreaterThan(2);
      expect(result.data!.body.name).toBe('David');
      expect(result.data!.body.isAdmin).toBe(true);
      expect(result.failure).toBeUndefined();
      expect(result.reason).toBeUndefined();
      expect(result.raw).toBeInstanceOf(Response);
    });
    it('POST /api/test-client - API Error (400)', async () => {
      const result = await lowLevelApiClient['api/test-client'].$post({ body: { name: 'error' } });
      expect(result.ok).toBe(false);
      expect(result.isValid).toBe(true); // 400 response schema is defined
      expect(result.failure!.status).toBe(400);
      if (result.failure?.status === 400) {
        expect(result.failure.body).toEqual({ message: 'Cannot create user with name error' });
      } else {
        throw new Error('Expected failure status 400');
      }
      expect(result.data).toBeUndefined();
      expect(result.reason).toBeUndefined();
      expect(result.raw).toBeInstanceOf(Response);
      expect(result.raw!.status).toBe(400);
    });
    it('POST /api/test-client - Validation Error (422)', async () => {
      // Send body that passes client validation but triggers MSW 422
      const result = await lowLevelApiClient['api/test-client'].$post({ body: { name: '' } });
      expect(result.ok).toBe(false);
      expect(result.isValid).toBe(true); // 422 response schema is defined
      expect(result.failure!.status).toBe(422);
      if (result.failure?.status === 422) {
        expect(result.failure.body.error).toBe('Unprocessable Entity');
        expect(result.failure.body.issues).toBeDefined();
      } else {
        throw new Error('Expected failure status 422');
      }
      expect(result.data).toBeUndefined();
      expect(result.reason).toBeUndefined();
      expect(result.raw).toBeInstanceOf(Response);
      expect(result.raw!.status).toBe(422);
    });
    it('POST /api/test-client - Request Body Validation Error', async () => {
      const result = await lowLevelApiClient['api/test-client'].$post({
        body: { invalid: true } as unknown as z.infer<typeof testClientSpec.post.body>,
      });
      expect(result.ok).toBeUndefined(); // Request not sent
      expect(result.isValid).toBe(false);
      expect(result.reason!).toBeInstanceOf(ZodError);
      expect(result.reason!.issues[0].path).toEqual(['name']);
      expect(result.data).toBeUndefined();
      expect(result.failure).toBeUndefined();
      expect(result.raw).toBeUndefined(); // Raw is undefined because request wasn't sent
    });

    // PUT tests
    it('PUT /api/test-client/:userId - Success', async () => {
      const result = await lowLevelApiClient['api/test-client']['[userId]'].$put({
        params: { userId: 1 },
        body: { isAdmin: false },
      });
      expect(result.ok).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.data!.status).toBe(200);
      expect(result.data!.body.id).toBe(1);
      expect(result.data!.body.name).toBe('Alice'); // Name is reset by afterEach
      expect(result.data!.body.isAdmin).toBe(false);
      expect(result.raw).toBeInstanceOf(Response);
    });
    it('PUT /api/test-client/:userId - Not Found (404)', async () => {
      const result = await lowLevelApiClient['api/test-client']['[userId]'].$put({
        params: { userId: 3 },
        body: { name: 'Nobody' },
      });
      expect(result.ok).toBe(false);
      expect(result.isValid).toBe(true); // 404 response schema is defined
      expect(result.failure!.status).toBe(404);
      expect(result.failure!.body).toEqual({ message: 'User not found' });
      expect(result.raw).toBeInstanceOf(Response);
      expect(result.raw!.status).toBe(404);
    });

    // DELETE tests
    it('DELETE /api/test-client/:userId - Success (204)', async () => {
      // Use a user ID not deleted by $fc test
      const result = await lowLevelApiClient['api/test-client']['[userId]'].$delete({
        params: { userId: 1 },
      });
      expect(result.ok).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.data!.status).toBe(204);
      expect(result.data!.body).toBeUndefined(); // No body for 204
      expect(result.raw).toBeInstanceOf(Response);
      expect(result.raw!.status).toBe(204);
    });
    it('DELETE /api/test-client/:userId - Not Found (404)', async () => {
      const result = await lowLevelApiClient['api/test-client']['[userId]'].$delete({
        params: { userId: 3 },
      });
      expect(result.ok).toBe(false);
      expect(result.isValid).toBe(true); // 404 response schema is defined
      expect(result.failure!.status).toBe(404);
      expect(result.failure!.body).toEqual({ message: 'User not found' });
      expect(result.raw).toBeInstanceOf(Response);
      expect(result.raw!.status).toBe(404);
    });

    // PATCH tests (FormData)
    it('PATCH /api/test-client - Success', async () => {
      const blob = new Blob(['more content'], { type: 'image/jpeg' });

      const result = await lowLevelApiClient['api/test-client'].$patch({
        body: { userId: 'user-789', avatar: new File([blob], 'photo.jpg') },
      });
      expect(result.ok).toBe(true);
      expect(result.isValid).toBe(true);
      expect(result.data!.status).toBe(200);
      expect(result.data!.body.message).toContain('user-789');
      expect(result.data!.body.fileName).toBe('photo.jpg');
      expect(result.data!.body.size).toBe(blob.size);
    });
    it('PATCH /api/test-client - Missing file', async () => {
      const result = await lowLevelApiClient['api/test-client'].$patch({
        body: { userId: 'user-789' } as z.infer<typeof testClientSpec.patch.body>,
      });
      expect(result.ok).toBeUndefined();
      expect(result.isValid).toBe(false);
      expect(result.reason).toBeInstanceOf(ZodError);
    });
    it('PATCH /api/test-client - Request Body Validation Error', async () => {
      const result = await lowLevelApiClient['api/test-client'].$patch({
        body: {} as unknown as z.infer<typeof testClientSpec.patch.body>,
      });
      expect(result.ok).toBeUndefined();
      expect(result.isValid).toBe(false);
      expect(result.reason!).toBeInstanceOf(ZodError);
      // Check which field failed validation (could be userId or avatar depending on Zod schema)
      expect(['userId', 'avatar']).toContain(result.reason!.issues[0].path[0]);
      expect(result.raw).toBeUndefined();
    });

    // STREAM tests (Raw Response)
    it('POST /api/test-client/stream - Success', async () => {
      // fc also returns raw Response when 'res' is omitted
      const result = await lowLevelApiClient['api/test-client'].stream.$post({
        body: { prompt: 'Test' },
      });
      expect(result.ok).toBe(true);
      expect(result.isValid).toBe(true); // No validation schema defined for response
      expect(result.data).toBeInstanceOf(Response);
      expect(result.data!.status).toBe(200);
      expect(result.data!.headers.get('content-type')).toContain('text/plain');
      expect(result.failure).toBeUndefined();
      expect(result.reason).toBeUndefined();
      expect(result.raw).toBeInstanceOf(Response);
      // Read the stream
      const reader = result.data!.body!.getReader();
      let streamedContent = '';
      let chunk;
      while (!(chunk = await reader.read()).done) {
        streamedContent += new TextDecoder().decode(chunk.value);
      }
      expect(streamedContent).toContain('Streaming response for prompt: "Test"');
    });
    it('POST /api/test-client/stream - API Error (400)', async () => {
      const result = await lowLevelApiClient['api/test-client'].stream.$post({
        body: { prompt: '' },
      });
      expect(result.ok).toBe(false);
      expect(result.isValid).toBe(true);
      expect(result.data).toBeUndefined();
      expect(result.failure).toBeInstanceOf(Response);
      expect(result.failure!.status).toBe(400);
      await expect(result.failure!.text()).resolves.toBe('Prompt is required');
      expect(result.reason).toBeUndefined();
      expect(result.error).toBeUndefined();
      expect(result.raw).toBeInstanceOf(Response);
    });
  });
});
