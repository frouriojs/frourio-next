import { spawn, spawnSync } from 'child_process';
import { readdirSync } from 'fs';

readdirSync('./projects', { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .forEach((dir) => {
    spawnSync('node', ['../../bin/index.js'], { cwd: `./projects/${dir.name}`, stdio: 'inherit' });
    spawn('node', ['../../bin/openapi.js'], { cwd: `./projects/${dir.name}`, stdio: 'inherit' });
    spawn('node', ['../../bin/msw.js'], { cwd: `./projects/${dir.name}`, stdio: 'inherit' });
  });
