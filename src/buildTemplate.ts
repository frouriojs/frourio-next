import path from 'path';
import type { Config } from './getConfig';
import { createNextTemplate } from './nextjs/createNextTemplate';

let prevPagesText = '';

export const resetCache = () => {
  prevPagesText = '';
};

export default ({ output, appDir }: Config) => {
  const emptyPathRegExp = /\n.+{\n+ +}.*/;

  let text = createNextTemplate(output, appDir);

  while (emptyPathRegExp.test(text)) {
    text = text.replace(emptyPathRegExp, '');
  }

  prevPagesText = text;

  return {
    text: prevPagesText,
    filePath: path.posix.join(output, '$path.ts'),
  };
};
