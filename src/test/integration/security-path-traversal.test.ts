import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import * as path from 'path';
import { test } from '../../index.js';
import { expect } from 'chai';
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const run = (args: string[]) => spawnSync(process.execPath, ['--import', 'tsx', 'src/bin/run-tests.ts', ...args], { cwd: projectRoot, encoding: 'utf-8' });
test({
  setup: () => ({ timeout: 60000 }),
  'Path Traversal Protection': {
    'blocks unsafe paths': () => {
      expect(run(['src/test/examples', '--coverage', '--coverage-dir', '..']).stderr).to.contain('Security Error');
      expect(run(['src/test/examples', '--reporter', 'json', '--output', '../u.json']).stderr).to.contain('Security Error');
      expect(run(['src/test/examples', '--coverage', '--coverage-dir', '.']).stderr).to.contain('Security Error');
    }
  }
});
