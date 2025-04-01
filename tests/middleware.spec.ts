import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';
import { describe, expect, test, vi } from 'vitest';

// Import handlers and middleware from the created routes
import * as adminMwRoute from '../projects/basic/app/api/mw/admin/route';
import * as usersMwRoute from '../projects/basic/app/api/mw/admin/users/route';
import * as publicRoute from '../projects/basic/app/api/mw/public/route';
import * as rootMwRoute from '../projects/basic/app/api/mw/route';

// Mock console.log to prevent cluttering test output
vi.spyOn(console, 'log').mockImplementation(() => {});

describe('Middleware Tests', () => {
  const baseUrl = 'http://localhost:3000';

  // --- Root Middleware Tests (/api/mw) ---
  describe('Root Middleware (/api/mw)', () => {
    test('GET /api/mw - No headers', async () => {
      const req = new NextRequest(`${baseUrl}/api/mw`);
      // Directly call the exported GET handler after middleware processing
      // Note: We test the middleware logic implicitly by checking the context passed to the handler
      const res = await rootMwRoute.GET(req, {}); // Context is handled internally by createRoute

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.userId).toBeUndefined();
      expect(body.traceId).toBeDefined(); // Default traceId should be generated
    });

    test('GET /api/mw - User Authorization header', async () => {
      const userId = 'user-123';
      const traceId = randomUUID();
      const req = new NextRequest(`${baseUrl}/api/mw`, {
        headers: {
          Authorization: `Bearer ${userId}`,
          'X-Trace-Id': traceId,
        },
      });
      const res = await rootMwRoute.GET(req, {});

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.userId).toBe(userId);
      expect(body.traceId).toBe(traceId);
    });

    test('GET /api/mw - Admin Authorization header', async () => {
      const userId = 'user-admin'; // Use a specific ID for admin tests later
      const traceId = randomUUID();
      const req = new NextRequest(`${baseUrl}/api/mw`, {
        headers: {
          Authorization: `Bearer ${userId}`,
          'X-Trace-Id': traceId,
        },
      });
      const res = await rootMwRoute.GET(req, {});

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.userId).toBe(userId);
      expect(body.traceId).toBe(traceId);
    });
  });

  // --- Nested Middleware Tests (/api/mw/admin) ---
  describe('Nested Middleware (/api/mw/admin)', () => {
    const adminUserId = 'user-admin';
    const normalUserId = 'user-regular';
    const traceId = randomUUID();

    test('GET /api/mw/admin - Admin User', async () => {
      const req = new NextRequest(`${baseUrl}/api/mw/admin`, {
        headers: {
          Authorization: `Bearer ${adminUserId}`,
          'X-Trace-Id': traceId,
        },
      });
      const res = await adminMwRoute.GET(req, {});

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.userId).toBe(adminUserId);
      expect(body.traceId).toBe(traceId);
      expect(body.isAdmin).toBe(true);
      expect(body.permissions).toEqual(['read', 'write', 'delete']);
    });

    test('POST /api/mw/admin - Admin User', async () => {
      const postData = { data: 'admin data' };
      const req = new NextRequest(`${baseUrl}/api/mw/admin`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminUserId}`,
          'X-Trace-Id': traceId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      const res = await adminMwRoute.POST(req, {});

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.received).toBe(postData.data);
      expect(body.context.userId).toBe(adminUserId);
      expect(body.context.isAdmin).toBe(true);
    });

    test('GET /api/mw/admin - Normal User', async () => {
      const req = new NextRequest(`${baseUrl}/api/mw/admin`, {
        headers: {
          Authorization: `Bearer ${normalUserId}`,
          'X-Trace-Id': traceId,
        },
      });
      const res = await adminMwRoute.GET(req, {}); // GET is allowed for non-admins

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.userId).toBe(normalUserId);
      expect(body.traceId).toBe(traceId);
      expect(body.isAdmin).toBe(false);
      expect(body.permissions).toEqual(['read']);
    });

    test('POST /api/mw/admin - Normal User (Forbidden)', async () => {
      const postData = { data: 'user data' };
      const req = new NextRequest(`${baseUrl}/api/mw/admin`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${normalUserId}`,
          'X-Trace-Id': traceId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      // The middleware itself should return the 403 response
      const res = await adminMwRoute.POST(req, {});

      expect(res.status).toBe(403);
      await expect(res.json()).resolves.toEqual({ message: 'Forbidden: Admin access required' });
    });

    test('POST /api/mw/admin - No Auth (Forbidden)', async () => {
      const postData = { data: 'no auth data' };
      const req = new NextRequest(`${baseUrl}/api/mw/admin`, {
        method: 'POST',
        headers: {
          'X-Trace-Id': traceId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
      const res = await adminMwRoute.POST(req, {});

      expect(res.status).toBe(403);
      await expect(res.json()).resolves.toEqual({ message: 'Forbidden: Admin access required' });
    });
  });

  // --- Middleware Inheritance Tests (/api/mw/admin/users) ---
  describe('Middleware Inheritance (/api/mw/admin/users)', () => {
    const adminUserId = 'user-admin';
    const normalUserId = 'user-regular';
    const traceId = randomUUID();

    test('GET /api/mw/admin/users - Admin User', async () => {
      const req = new NextRequest(`${baseUrl}/api/mw/admin/users?role=admin`, {
        headers: {
          Authorization: `Bearer ${adminUserId}`,
          'X-Trace-Id': traceId,
        },
      });
      const res = await usersMwRoute.GET(req, {});

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.context.userId).toBe(adminUserId);
      expect(body.context.traceId).toBe(traceId);
      expect(body.context.isAdmin).toBe(true);
      expect(body.context.permissions).toEqual(['read', 'write', 'delete']);
      expect(body.users).toEqual(['admin1']); // Check filtering based on query
    });

    test('GET /api/mw/admin/users - Normal User (Forbidden by parent middleware)', async () => {
      const req = new NextRequest(`${baseUrl}/api/mw/admin/users`, {
        headers: {
          Authorization: `Bearer ${normalUserId}`,
          'X-Trace-Id': traceId,
        },
      });
      // The parent middleware (/api/mw/admin) should block this request
      const res = await usersMwRoute.GET(req, {});

      expect(res.status).toBe(403);
      await expect(res.json()).resolves.toEqual({ message: 'Forbidden: Admin access required' });
    });

    test('GET /api/mw/admin/users - No Auth (Forbidden by parent middleware)', async () => {
      const req = new NextRequest(`${baseUrl}/api/mw/admin/users`, {
        headers: {
          'X-Trace-Id': traceId,
        },
      });
      const res = await usersMwRoute.GET(req, {});

      expect(res.status).toBe(403);
      await expect(res.json()).resolves.toEqual({ message: 'Forbidden: Admin access required' });
    });
  });

  // --- No Middleware Tests (/api/mw/public) ---
  describe('No Middleware (/api/mw/public)', () => {
    test('GET /api/mw/public - No headers', async () => {
      const req = new NextRequest(`${baseUrl}/api/mw/public`);
      const res = await publicRoute.GET(req, {});

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ message: 'This is a public endpoint.' });
      // No context should be passed or expected
    });

    test('GET /api/mw/public - With Authorization header (should be ignored)', async () => {
      const req = new NextRequest(`${baseUrl}/api/mw/public`, {
        headers: {
          Authorization: 'Bearer some-token', // This header should have no effect
        },
      });
      const res = await publicRoute.GET(req, {});

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ message: 'This is a public endpoint.' });
    });
  });
});
