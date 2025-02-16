import { exec } from 'child_process';
import { projects } from './projects';

projects.forEach(({ dir, output, enableStatic }) =>
  exec(
    `cd projects/${dir} && node ../../bin/index.js${output ? ` --output ${output}` : ''}${
      enableStatic ? ' --enableStatic' : ''
    }`,
    (_err, stdout, stderr) => console.log(stdout, stderr),
  ),
);
