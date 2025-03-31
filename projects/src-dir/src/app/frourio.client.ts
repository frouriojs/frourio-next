import { z } from 'zod';
import { frourioSpec } from './frourio'

const $path = {
  post(req: {  }) {
    return ``;
  },
};

export const fc = {
  async $post(req: { body: z.infer<typeof frourioSpec.post.body>, init?: RequestInit }) {
    const url = $path.post(req);

    if (!url) return;

    const parsedBody = frourioSpec.post.body.safeParse(req.body);

    if (!parsedBody.success) return;

    const formData = new FormData();

    Object.entries(parsedBody.data).forEach(([key, value]) => {
      if (value === undefined) return;

      if (Array.isArray(value)) {
        value.forEach((item) =>
          item instanceof File
            ? formData.append(key, item, item.name)
            : formData.append(key, item.toString()),
        );
      } else if (value instanceof File) {
        formData.set(key, value, value.name);
      } else {
        formData.set(key, value.toString());
      }
    });

    const res = await fetch(
      url,
      {
        method: 'POST',
        headers: { 'content-type': 'multipart/form-data', },
        body: formData,
        ...req.init,
      }
    );
  },
  $path,
};
