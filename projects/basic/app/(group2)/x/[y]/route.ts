import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createRoute } from './frourio.server';

export const { GET, middleware } = createRoute({
  middleware: async ({ req, next }) => {
    return next(req);
  },
  get: async ({ query }) => {
    const result = streamText({
      model: openai('gpt-4o'),
      system: 'You are a helpful assistant.',
      messages: [{ role: 'user', content: query.message }],
    });

    return result.toDataStreamResponse();
  },
});
