import { createRoute } from './frourio.server';

export const { POST } = createRoute({
  post: async ({ body }) => {
    return {
      status: 200,
      body: {
        ...body,
        file: body.file.name,
        fileArr: body.fileArr.map((f) => f.name),
        optionalFile: body.optionalFile?.name,
        optionalFileArr: body.optionalFileArr?.map((f) => f.name),
      },
    };
  },
});
