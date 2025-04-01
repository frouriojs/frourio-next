# FrourioNext

<br />
<img src="https://frouriojs.github.io/frourio/assets/images/ogp.png" width="1280" alt="frourio" />

<div align="center">
  <a href="https://www.npmjs.com/package/@frourio/next">
    <img src="https://img.shields.io/npm/v/@frourio/next" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/@frourio/next">
    <img src="https://img.shields.io/npm/dm/@frourio/next" alt="npm download" />
  </a>
</div>
<br />
<p align="center"><strong>Type-safe Next.js App Router Route Handlers with Zod validation and an auto-generated type-safe HTTP client.</strong></p>
<br />
<br />

FrourioNext streamlines API development in Next.js App Router by providing:

- **End-to-End Type Safety**: Define your API shape once using Zod schemas in `frourio.ts` and get type safety across your server handlers and client calls.
- **Runtime Validation**: Automatically validate incoming request parameters, query strings, headers, and bodies against your Zod schemas within Route Handlers.
- **Auto-Generated Type-Safe Client**: Generates a type-safe HTTP client (`frourio.client.ts`) for making API requests from your frontend or other server-side code, ensuring your calls match the defined API structure.
- **Middleware Support**: Define and implement middleware for shared logic like authentication or logging.
- **OpenAPI Generation**: Optionally generate OpenAPI 3.1 specification files from your route definitions.

## ✨ Key Features

- **🚀 Define Once, Use Everywhere**: Zod schemas in `frourio.ts` act as the single source of truth for request/response shapes.
- **🔒 Automatic Validation**: `createRoute` helper automatically validates requests and responses, reducing boilerplate and potential errors.
- **🤝 Seamless Client Integration**: The generated client functions (`fc`, `$fc`) provide familiar, type-safe ways to interact with your API, catching errors at compile time.
- **⚙️ Zero Configuration**: Sensible defaults allow immediate use after installation.
- **🧩 Flexible Middleware**: Implement route-specific or inherited middleware with type-safe context passing.
- **📄 Standards Compliant**: Generate OpenAPI 3.1 documentation effortlessly.

## 📦 Installation

```bash
# Using npm
npm install next zod
npm install @frourio/next npm-run-all --save-dev

# Using yarn
yarn add next zod
yarn add @frourio/next npm-run-all --dev

# Using pnpm
pnpm add next zod
pnpm add @frourio/next npm-run-all --save-dev
```

## 🛠️ Setup

Add the FrourioNext CLI commands to the `scripts` section of your `package.json`:

```json
{
  "scripts": {
    "dev": "run-p dev:*",
    "dev:next": "next dev",
    "dev:frourio": "frourio-next --watch", // Watches frourio.ts files and generates .server.ts and .client.ts
    "build": "frourio-next && next build", // Generates files before building
    // Optional: Add OpenAPI generation
    "dev:openapi": "frourio-next-openapi --output=./public/openapi.json --watch",
    "build:openapi": "frourio-next-openapi --output=./public/openapi.json"
  }
}
```

- `frourio-next`: The core command that generates `*.server.ts` (server-side helpers) and `*.client.ts` (type-safe client).
- `frourio-next-openapi`: (Optional) Generates an OpenAPI 3.1 JSON file based on your `frourio.ts` definitions.

## 🚀 Core Concepts & Usage

FrourioNext revolves around defining your API structure in `frourio.ts` files and using the auto-generated helpers.

### 1. Define API Specification (`frourio.ts`)

In each API route directory (e.g., `app/api/users/[userId]/`), create a `frourio.ts` file. Use Zod to define the schemas for path parameters (`params`), query parameters (`query`), request headers (`headers`), request body (`body`), and possible responses (`res`).

`app/api/tasks/[taskId]/frourio.ts`:

```typescript
import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

// Define reusable schemas if needed
const TaskSchema = z.object({
  id: z.string().uuid(),
  label: z.string(),
  isDone: z.boolean(),
});

const ErrorSchema = z.object({ message: z.string() });

export const frourioSpec = {
  // Define path parameter schema
  params: z.object({ taskId: z.string().uuid() }),

  // Define specs for the GET method
  get: {
    // Define query schema (optional)
    query: z.object({
      includeAssignee: z.boolean().optional(),
    }),
    // Define possible responses with status codes
    res: {
      200: { body: TaskSchema }, // Success
      404: { body: ErrorSchema }, // Not Found
    },
  },

  // Define specs for the PATCH method
  patch: {
    // Define request body schema
    body: TaskSchema.pick({ label: true, isDone: true }).partial(), // Allow partial updates
    res: {
      200: { body: TaskSchema }, // Success
      400: { body: ErrorSchema }, // Bad Request (e.g., invalid data)
      404: { body: ErrorSchema }, // Not Found
    },
  },

  // Define specs for the DELETE method
  delete: {
    res: {
      204: {}, // Success (No Content)
      404: { body: ErrorSchema }, // Not Found
    },
  },
} satisfies FrourioSpec;

// Export inferred types for convenience (optional but recommended)
export type Task = z.infer<typeof TaskSchema>;
```

### 2. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Running `dev` starts both the Next.js server and the `frourio-next --watch` process. FrourioNext will automatically detect changes in `frourio.ts` files and generate/update:

- `app/api/tasks/[taskId]/frourio.server.ts`: Contains the `createRoute` helper function tailored for this specific route.
- `app/api/tasks/[taskId]/frourio.client.ts`: Contains the type-safe client functions (`fc`, `$fc`) for this route and its children.

### 3. Implement the Route Handler (`route.ts`)

Create a `route.ts` file next to `frourio.ts`. Import `createRoute` from the generated `frourio.server.ts` and implement your API logic.

`app/api/tasks/[taskId]/route.ts`:

```typescript
import { createRoute } from './frourio.server';
import type { Task } from './frourio'; // Import type if needed

// Mock database - replace with your actual data fetching logic
const db = new Map<string, Task>();
db.set('task-1', { id: 'task-1', label: 'Implement Frourio', isDone: false });

export const { GET, PATCH, DELETE } = createRoute({
  // GET /api/tasks/:taskId
  // 'req' contains validated { params, query, headers, body } based on frourio.ts
  get: async ({ params, query }) => {
    console.log('Fetching task:', params.taskId); // Type-safe: params.taskId is string
    console.log('Include assignee?', query.includeAssignee); // Type-safe: query.includeAssignee is boolean | undefined

    const task = db.get(params.taskId);

    if (!task) {
      // Type-safe: Must match one of the defined 'res' statuses and schemas in frourio.ts
      return { status: 404, body: { message: 'Task not found' } };
    }

    // Type-safe: Must match the 200 response schema
    return { status: 200, body: task };
  },

  // PATCH /api/tasks/:taskId
  patch: async ({ params, body }) => {
    const existingTask = db.get(params.taskId);
    if (!existingTask) {
      return { status: 404, body: { message: 'Task not found' } };
    }

    // Type-safe: 'body' matches the PATCH body schema (partial Task)
    const updatedTask = { ...existingTask, ...body };
    db.set(params.taskId, updatedTask);

    console.log('Updated task:', updatedTask);
    return { status: 200, body: updatedTask };
  },

  // DELETE /api/tasks/:taskId
  delete: async ({ params }) => {
    if (!db.has(params.taskId)) {
      return { status: 404, body: { message: 'Task not found' } };
    }
    db.delete(params.taskId);
    console.log('Deleted task:', params.taskId);
    // Type-safe: Must match the 204 response schema (no body)
    return { status: 204 };
  },
});

// How createRoute works:
// 1. It receives your controller implementation.
// 2. For each method (GET, POST, etc.), it generates a Next.js Route Handler.
// 3. Inside the handler, it parses and validates the incoming NextRequest (params, query, headers, body) using the schemas from frourio.ts.
// 4. If validation fails, it returns an appropriate error response (e.g., 400, 422).
// 5. If validation succeeds, it calls your controller function with the typed, validated request data.
// 6. It validates the response returned by your controller against the 'res' schemas in frourio.ts.
// 7. If response validation fails, it returns a 500 error.
// 8. If response validation succeeds, it sends the response to the client.
```

### 4. Initialize and Use the Type-Safe Client

FrourioNext generates `frourio.client.ts` files, which export client functions (`fc` and `$fc`). It's best practice to initialize a central client instance.

`lib/apiClient.ts` (Client Initialization):

```typescript
import { fc, $fc } from '@/app/api/frourio.client'; // Import from the root generated client

// Initialize the high-level client ($fc) - throws errors, returns parsed body
export const apiClient = $fc({
  // Optional: Set base URL if your API is hosted elsewhere or for consistency
  // baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  // Optional: Provide default fetch options (e.g., headers, credentials)
  // init: {
  //   headers: { 'X-Custom-Header': 'value' },
  //   credentials: 'include',
  // },
  // Optional: Provide a custom fetch implementation
  // fetch: (input, init) => {
  //   console.log('Custom fetch:', input, init);
  //   return fetch(input, init);
  // }
});

// Initialize the low-level client (fc) - returns detailed response object
export const lowLevelApiClient = fc({
  // You can use the same options as $fc
});

// The root frourio.client.ts aggregates clients from subdirectories.
// Calling $fc() or fc() gives you access to the entire API structure defined under app/api/.
```

Now, use the initialized clients in your frontend components or server-side code:

`app/components/TaskDetails.tsx` (Example Client Usage):

```typescript
'use client';

import { useEffect, useState } from 'react';
// Import the initialized clients
import { apiClient, lowLevelApiClient } from '@/lib/apiClient';
import type { Task } from '@/app/api/tasks/[taskId]/frourio'; // Import type if needed

interface TaskDetailsProps {
  taskId: string;
}

export function TaskDetails({ taskId }: TaskDetailsProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // --- Using the high-level client ($fc) ---
        // Automatically handles response parsing and throws on error.
        const fetchedTask = await apiClient.tasks._taskId(taskId).$get({
          query: { includeAssignee: true },
        });
        setTask(fetchedTask);

        // --- OR Using the low-level client (fc) ---
        // Returns a detailed result object, requiring manual checking.
        // const result = await lowLevelApiClient.tasks._taskId(taskId).$get({
        //   query: { includeAssignee: true },
        // });
        //
        // if (!result.ok) {
        //   // Handle non-2xx status codes
        //   const errorBody = await result.data.json().catch(() => ({ message: 'Unknown error' }));
        //   throw new Error(`API Error ${result.data.status}: ${errorBody.message}`);
        // }
        // if (!result.isValid) {
        //   // Handle response validation errors (schema mismatch)
        //   console.error("Response validation failed:", result.error);
        //   throw new Error('Invalid response data from server.');
        // }
        // // Access the validated body
        // setTask(result.data.body);

      } catch (err: any) {
        console.error('API Error:', err);
        // Error handling for $fc client (or manual errors thrown when using fc)
        setError(err.message || 'Failed to fetch task.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  const handleToggleDone = async () => {
    if (!task) return;
    try {
      // Using $fc for simplicity
      const updatedTask = await apiClient.tasks._taskId(taskId).$patch({
        body: { isDone: !task.isDone },
      });
      setTask(updatedTask);
    } catch (err: any) {
      console.error('Failed to update task:', err);
      setError(err.message || 'Failed to update task.');
    }
  };

   const handleDelete = async () => {
    if (!taskId) return;
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      // Using $fc - returns void on success (204)
      await apiClient.tasks._taskId(taskId).$delete();
      setTask(null);
      alert('Task deleted');
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      setError(err.message || 'Failed to delete task.');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!task) return <div>Task not found.</div>;

  return (
    <div>
      <h2>{task.label}</h2>
      <p>Status: {task.isDone ? 'Done' : 'Pending'}</p>
      <button onClick={handleToggleDone}>
        Mark as {task.isDone ? 'Pending' : 'Done'}
      </button>
      <button onClick={handleDelete} style={{ marginLeft: '10px', color: 'red' }}>
        Delete Task
      </button>
    </div>
  );
}
```

**Client Functions (`fc` vs `$fc`)**:

- **`$fc` (High-Level Client)**:

  - Designed for ease of use.
  - Automatically parses the JSON response body.
  - Validates the response body against the expected Zod schema defined in `frourio.ts`.
  - **Returns the validated response body directly** on success (e.g., the `Task` object).
  - **Throws an error** if:
    - The request fails (network error).
    - The response status is not OK (e.g., 4xx, 5xx).
    - The response body fails Zod validation.
  - Ideal for most common use cases where you primarily need the response data and want automatic error handling for non-successful responses.

- **`fc` (Low-Level Client)**:
  - Provides more control over the response handling.
  - **Returns a detailed result object** containing:
    - `ok`: Boolean indicating if the status code was in the 2xx range.
    - `isValid`: Boolean indicating if the response body passed Zod validation.
    - `data`: The raw `Response` object (if `ok` is false or `isValid` is false) or an object containing `status`, `headers`, and the validated `body` (if `ok` and `isValid` are true).
    - `error`: The Zod validation error (if `isValid` is false) or the fetch error.
  - **Does not throw errors automatically** based on status code or validation failure. You need to check the `ok` and `isValid` flags manually.
  - Useful when you need to access response headers, handle different status codes specifically, or implement custom error handling logic without relying on exceptions.

**Structure**: Both clients mirror your API directory structure:

- Directory names become properties: `apiClient.users`, `lowLevelApiClient.tasks`.
- Dynamic segments (`[param]`) become methods prefixed with `_`: `apiClient.tasks._taskId('abc')`.
- HTTP methods are called with `$`: `.$get()`, `.$post()`, `.$patch()`, `.$delete()`.
- Request data (`query`, `body`, `headers`) is passed in an object, fully typed according to `frourio.ts`.

## 🧱 Middleware

Define middleware in `frourio.ts` to execute code before your main route handlers. Middleware can be inherited from parent directories.

### 1. Define Middleware in `frourio.ts`

- **Inherit**: Set `middleware: true` to use middleware defined in parent directories.
- **Define**: Specify a `middleware` object with a `context` schema (using Zod) to define the data passed _from_ this middleware _to_ its children (handlers or nested middleware).

`app/api/frourio.ts` (Root middleware - e.g., for authentication):

```typescript
import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

// Define the context this middleware provides
const AuthContextSchema = z.object({
  user: z.object({ id: z.string(), roles: z.array(z.string()) }).optional(),
});

export const frourioSpec = {
  middleware: {
    context: AuthContextSchema,
  },
  // Routes defined directly under /api can use AuthContext
} satisfies FrourioSpec;

export type AuthContext = z.infer<typeof AuthContextSchema>;
```

`app/api/admin/frourio.ts` (Nested middleware - inherits AuthContext, adds AdminContext):

```typescript
import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

// Define additional context specific to /admin routes
const AdminContextSchema = z.object({
  isAdmin: z.boolean(),
});

export const frourioSpec = {
  // Inherit parent middleware (AuthContext) AND define new context (AdminContext)
  middleware: {
    context: AdminContextSchema,
  },
  // Routes under /api/admin will receive both AuthContext and AdminContext
} satisfies FrourioSpec;

export type AdminContext = z.infer<typeof AdminContextSchema>;
```

### 2. Implement Middleware in `route.ts`

Implement the middleware logic within the `createRoute` call. The `middleware` function receives the request (`req`), a `next` function, and the context (`parentContext`) passed from parent middleware. It calls `next(req, newContext)` to proceed, passing the context defined in its corresponding `frourio.ts`.

`app/api/route.ts` (Root middleware implementation):

```typescript
import { createRoute } from './frourio.server';
import type { AuthContext } from './frourio'; // Import context type

// Mock auth logic
const authenticate = (req: Request): AuthContext['user'] => {
  const token = req.headers.get('Authorization')?.split(' ')[1];
  if (token === 'valid-user-token') {
    return { id: 'user-123', roles: ['viewer'] };
  }
  if (token === 'valid-admin-token') {
    return { id: 'admin-456', roles: ['admin', 'viewer'] };
  }
  return undefined;
};

export const { middleware } = createRoute({
  // Implement the middleware defined in app/api/frourio.ts
  middleware: async ({ req, next }) => {
    const user = authenticate(req);
    console.log('Root Middleware: User authenticated:', user?.id);

    // Pass the AuthContext to the next handler/middleware
    return next(req, { user }); // Must match AuthContextSchema
  },

  // You can also define routes here that directly use AuthContext
  // get: async (req, context: AuthContext) => { ... }
});
```

`app/api/admin/route.ts` (Nested middleware implementation):

```typescript
import { createRoute } from './frourio.server';
import type { AuthContext } from '../frourio'; // Import parent context
import type { AdminContext } from './frourio'; // Import current context

// Combine context types for handlers within this route
type FullAdminContext = AuthContext & AdminContext;

export const { middleware } = createRoute({
  // Implement middleware defined in app/api/admin/frourio.ts
  // Receives AuthContext from the parent middleware
  middleware: async ({ req, next }, parentContext: AuthContext) => {
    console.log('Admin Middleware: Received user:', parentContext.user?.id);

    // Check if user has admin role (using context from parent)
    const isAdmin = parentContext.user?.roles.includes('admin') ?? false;

    if (!isAdmin) {
      // Middleware can return early to block access
      return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }

    // Pass the AdminContext to the next handler/middleware
    return next(req, { isAdmin }); // Must match AdminContextSchema
  },

  // Define admin-specific routes here
  // Handlers receive the combined context (AuthContext & AdminContext)
  // get: async (req, context: FullAdminContext) => {
  //   console.log('Admin GET handler: User:', context.user?.id, 'IsAdmin:', context.isAdmin);
  //   // ... admin logic ...
  // }
});
```

**Execution Flow**: Requests flow through middleware from parent directories down to the specific route. Each `middleware` implementation receives context from its parent and passes new context (defined in its own `frourio.ts`) to its children.

## 📁 Handling FormData (File Uploads)

Use `format: 'formData'` and `z.instanceof(File)` in `frourio.ts`.

`app/api/upload/frourio.ts`:

```typescript
import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const frourioSpec = {
  post: {
    format: 'formData', // Indicate FormData request
    body: z.object({
      userId: z.string(),
      profileImage: z.instanceof(File),
      documents: z.array(z.instanceof(File)).optional(),
    }),
    res: {
      201: { body: z.object({ message: z.string(), fileUrl: z.string() }) },
      400: { body: z.object({ message: z.string() }) },
    },
  },
} satisfies FrourioSpec;
```

`app/api/upload/route.ts`:

```typescript
import { createRoute } from './frourio.server';

export const { POST } = createRoute({
  post: async ({ body }) => {
    // Type-safe access to form fields and files
    console.log('Uploading for user:', body.userId);
    console.log('Profile Image:', body.profileImage.name, body.profileImage.size);
    if (body.documents) {
      console.log(
        'Documents:',
        body.documents.map((d) => d.name),
      );
    }

    // --- Add your file saving logic here ---
    // Example: await saveToCloudStorage(body.profileImage);
    const mockFileUrl = `/uploads/${body.userId}/${body.profileImage.name}`;
    // ---

    return {
      status: 201,
      body: { message: 'Upload successful', fileUrl: mockFileUrl },
    };
  },
});
```

**Client-Side**: The generated clients (`fc`, `$fc`) handle `FormData` automatically when `format: 'formData'` is specified. Just pass a `FormData` object as the `body`.

```typescript
const formData = new FormData();
formData.append('userId', 'user-123');
formData.append('profileImage', fileInput.files[0]);
// Append multiple files for array fields
// documentFiles.forEach(file => formData.append('documents', file));

try {
  // Using $fc for simplicity
  const result = await apiClient.upload.$post({ body: formData });
  console.log('Success:', result);
} catch (err) {
  console.error('Upload failed:', err);
}
```

## 🌊 LLM Streaming & Raw Response Handling

If you omit the `res` property in `frourio.ts` for a specific method, `createRoute` allows the handler to return _any_ standard `Response` object directly. This is useful for streaming responses (e.g., from LLMs) or when you need full control over the response.

`app/api/chat/frourio.ts`:

```typescript
import type { FrourioSpec } from '@frourio/next';
import { z } from 'zod';

export const frourioSpec = {
  post: {
    body: z.object({ prompt: z.string() }),
    // No 'res' property defined - handler must return a Response object
  },
} satisfies FrourioSpec;
```

`app/api/chat/route.ts` (Example using Vercel AI SDK):

```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai'; // Configure OpenAI client
import { createRoute } from './frourio.server';

export const { POST } = createRoute({
  post: async ({ body }) => {
    try {
      const result = await streamText({
        model: openai('gpt-4o'),
        messages: [{ role: 'user', content: body.prompt }],
      });

      // Return the streaming Response directly
      return result.toAIStreamResponse();
    } catch (error: any) {
      console.error('LLM Error:', error);
      return new Response(JSON.stringify({ error: 'LLM request failed' }), { status: 500 });
    }
  },
});
```

**Client-Side**: When `res` is omitted, both `fc` and `$fc` will return the raw `Response` object. You need to handle reading the stream or processing the response manually.

```typescript
try {
  // Both fc and $fc return Promise<Response> when 'res' is omitted
  const response = await apiClient.chat.$post({ body: { prompt: 'Tell me a joke' } });
  // Or: const response = (await lowLevelApiClient.chat.$post({ ... })).data;

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  // Handle the stream (example using AI SDK reader)
  const reader = response.body?.pipeThrough(createStreamDataTransformer()).getReader();
  // ... process stream ...
} catch (err) {
  console.error('Chat failed:', err);
}
```

## 🧪 Testing

Test your FrourioNext handlers like standard Next.js Route Handlers, typically by mocking `NextRequest` and calling the exported handler functions directly.

`tests/tasks.spec.ts` (Example using Vitest):

```typescript
import { NextRequest } from 'next/server';
import { expect, test, describe, vi } from 'vitest';
import { GET, PATCH } from '../app/api/tasks/[taskId]/route'; // Adjust path

// Mock any external dependencies (like databases) if necessary
vi.mock('../lib/database', () => ({
  getTaskById: async (id: string) =>
    id === 'task-1' ? { id: 'task-1', label: 'Mock Task', isDone: false } : null,
  updateTask: async (id: string, data: any) => ({ id, ...data }),
}));

describe('API Route: /api/tasks/[taskId]', () => {
  test('GET - Success', async () => {
    const taskId = 'task-1';
    const req = new NextRequest(`http://localhost/api/tasks/${taskId}?includeAssignee=true`);
    // Pass route params in the second argument
    const res = await GET(req, { params: { taskId } });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ id: 'task-1', label: 'Mock Task', isDone: false });
  });

  test('GET - Not Found', async () => {
    const taskId = 'unknown-task';
    const req = new NextRequest(`http://localhost/api/tasks/${taskId}`);
    const res = await GET(req, { params: { taskId } });

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ message: 'Task not found' });
  });

  test('PATCH - Success', async () => {
    const taskId = 'task-1';
    const payload = { label: 'Updated Mock Task' };
    const req = new NextRequest(`http://localhost/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await PATCH(req, { params: { taskId } });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ id: taskId, label: payload.label });
  });

  test('PATCH - Validation Error (Invalid Body)', async () => {
    const taskId = 'task-1';
    const invalidPayload = { isDone: 'not-a-boolean' }; // Invalid type
    const req = new NextRequest(`http://localhost/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(invalidPayload),
      headers: { 'Content-Type': 'application/json' },
    });
    // Directly call PATCH exported from route.ts
    const res = await PATCH(req, { params: { taskId } });

    // createRoute handles validation and returns 422
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toBe('Unprocessable Entity');
    expect(body.issues[0].path).toEqual(['isDone']);
    expect(body.issues[0].message).toBe('Expected boolean, received string');
  });
});
```

## 📜 OpenAPI 3.1 Generation

Generate OpenAPI documentation from your `frourio.ts` files using the `frourio-next-openapi` command.

### Setup & Usage

1.  Add the `frourio-next-openapi` script to `package.json` (see [Setup](#️-setup)).
2.  Run the command:
    ```bash
    npm run build:openapi
    # or with watch mode during development:
    npm run dev:openapi
    ```
3.  This generates the OpenAPI JSON file specified by the `--output` option.

### CLI Options (`frourio-next-openapi`)

| Option     | Alias | Type     | Description                                          |
| :--------- | :---- | :------- | :--------------------------------------------------- |
| `--output` | `-o`  | `string` | **Required.** Output path for the OpenAPI JSON file. |
| `--watch`  | `-w`  |          | Enable watch mode.                                   |

_(Based on `src/openapi/cli.ts`)_

## ⚙️ CLI Options (`frourio-next`)

| Option    | Alias | Type | Description                                                              |
| :-------- | :---- | :--- | :----------------------------------------------------------------------- |
| `--watch` | `-w`  |      | Enable watch mode. Regenerates `.server.ts` and `.client.ts` on changes. |

_(Based on `src/cli.ts`)_

## License

FrourioNext is licensed under the [MIT License](https://github.com/frouriojs/frourio-next/blob/main/LICENSE).
