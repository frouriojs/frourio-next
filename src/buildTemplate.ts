import path from 'path';
import { createNextTemplate } from './createNextTemplate';
import type { Config } from './getConfig';

export default ({ output, appDir }: Config) => {
  const emptyPathRegExp = /\n.+{\n+ +}.*/;

  let text = createNextTemplate(output, appDir);

  while (emptyPathRegExp.test(text)) {
    text = text.replace(emptyPathRegExp, '');
  }

  return {
    text,
    filePath: path.posix.join(output, '$path.ts'),
  };
};
