import { exec } from 'child_process';
import { projects } from './projects';

projects.forEach(({ dir, output }) =>
  exec(
    `cd projects/${dir} && node ../../bin/index.js${output ? ` --output ${output}` : ''}`,
    (_err, stdout, stderr) => console.log(stdout, stderr),
  ),
);
