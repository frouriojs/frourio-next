import path from 'path';
import type { Config } from '../getConfig';
import { createNextTemplate } from './createNextTemplate';

export default ({ output, appDir }: Config) => {
  const emptyPathRegExp = /\n.+{\n+ +}.*/;

  let text = createNextTemplate(appDir);

  while (emptyPathRegExp.test(text)) {
    text = text.replace(emptyPathRegExp, '');
  }

  return { text, filePath: path.posix.join(output, '$path.ts') };
};
