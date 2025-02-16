import fs from 'fs';
import path from 'path';
import { expect, test } from 'vitest';
import { projects } from '../projects/projects';
import getConfig from '../src/getConfig';
import build from '../src/old/buildTemplate';

test('main', async () => {
  for (const project of projects) {
    const workingDir = path.join(process.cwd(), 'projects', project.dir);
    const { output, appDir } = await getConfig(
      project.output && path.join(workingDir, project.output),
      workingDir,
    );

    const result = fs.readFileSync(`${output}/$path.ts`, 'utf8');
    const { filePath, text } = build({ output, appDir });

    expect(filePath).toBe(`${output}/$path.ts`);
    expect(
      text.replace(
        new RegExp(
          `${/\\/.test(workingDir) ? `${workingDir.replace(/\\/g, '\\\\')}(/src)?` : workingDir}/`,
          'g',
        ),
        '',
      ),
    ).toBe(result.replace(/\r/g, ''));
  }
});
