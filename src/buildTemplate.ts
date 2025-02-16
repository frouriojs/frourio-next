import path from 'path';
import { createStaticTemplate } from './createStaticTemplate';
import type { Config } from './getConfig';
import { createNextTemplate } from './nextjs/createNextTemplate';

let prevPagesText = '';
let prevStaticText = '';

export const resetCache = () => {
  prevPagesText = '';
  prevStaticText = '';
};

export default (
  { input, staticDir, output, basepath, pageExtensions, appDir }: Config,
  mode?: 'pages' | 'static',
) => {
  const emptyPathRegExp = /\n.+{\n+ +}.*/;

  if (mode !== 'static') {
    let text = createNextTemplate(input, output, appDir, pageExtensions);

    while (emptyPathRegExp.test(text)) {
      text = text.replace(emptyPathRegExp, '');
    }

    prevPagesText = text;
  }

  if (staticDir && mode !== 'pages') {
    let text = createStaticTemplate(staticDir, basepath);

    while (emptyPathRegExp.test(text)) {
      text = text.replace(emptyPathRegExp, '');
    }

    prevStaticText = text;
  }

  return {
    text: `${prevPagesText}${prevStaticText}`,
    filePath: path.posix.join(output, '$path.ts'),
  };
};
