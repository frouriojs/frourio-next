import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createRoute } from './frourio.server';

export const { GET } = createRoute({
  get: async ({ query }) => {
    const result = streamText({
      model: openai('gpt-4o'),
      system: 'You are a helpful assistant.',
      messages: [{ role: 'user', content: query.message }],
    });
  
    return result.toDataStreamResponse();
  },
});
