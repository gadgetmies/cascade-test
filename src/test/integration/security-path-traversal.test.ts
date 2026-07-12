import test from '../../lib/test.js';
import { spawnSync } from 'child_process';
test({
  'Security Path Traversal': {
    'should block traversal': () => {
      const run = (args: string[]) => spawnSync(process.execPath, ['--import', 'tsx', 'src/bin/run-tests.ts', 'src/test/integration/fixtures', ...args], { encoding: 'utf8' });
      if (!run(['--coverage', '--coverage-dir', '..']).stderr.includes('Security Error')) return 'coverage-dir failed';
      if (!run(['--output', '..']).stderr.includes('Security Error')) return 'output failed';
      if (!run(['--coverage', '--coverage-dir', '.']).stderr.includes('CWD')) return 'cwd-coverage failed';
    }
  }
});
