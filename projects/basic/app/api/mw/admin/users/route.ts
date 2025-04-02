import { createRoute } from './frourio.server';

export const { middleware, GET } = createRoute({
  middleware: async ({ req, next }, parentContext) => {
    console.log('Users Middleware (/api/mw/admin/users): Received parent context:', parentContext);

    if (!parentContext.isAdmin) {
      console.log('Users Middleware: Forbidden access for non-admin user.');

      return new Response(JSON.stringify({ message: 'Forbidden: Admin access required for users endpoint' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    return next(req);
  },
  get: async ({ query }, context) => {
    console.log('GET Handler (/api/mw/admin/users): Received full context:', context);
    console.log('GET Handler (/api/mw/admin/users): Received query:', query);

    const users = ['user1', 'user2', 'admin1'];
    const filteredUsers = query.role ? users.filter(u => u.includes(query.role as string)) : users;

    return { status: 200, body: { context, users: filteredUsers } };
  },
});