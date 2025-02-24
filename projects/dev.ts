import { spawn } from 'child_process';
import { readdirSync } from 'fs';

readdirSync('./projects', { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .forEach((dir) => {
    spawn('node', ['../../bin/index.js'], { cwd: `./projects/${dir.name}`, stdio: 'inherit' });
    spawn('node', ['../../bin/openapi.js'], { cwd: `./projects/${dir.name}`, stdio: 'inherit' });
  });
