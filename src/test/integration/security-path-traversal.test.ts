import { test } from '../../index.js';
import { spawnSync } from 'child_process';
import { expect } from 'chai';

test({
  'Security: Path Traversal': {
    setup: () => ({ timeout: 60000 }),
    'blocks unsafe coverage directory': () => {
      const result = spawnSync(process.execPath, ['--import', 'tsx', 'src/bin/run-tests.ts', 'src/test/integration/fixtures', '--coverage', '--coverage-dir', '../unsafe-dir'], { encoding: 'utf8' });
      expect(result.stdout + result.stderr).to.contain('Security Error');
    },
    'blocks unsafe output path': () => {
      const result = spawnSync(process.execPath, ['--import', 'tsx', 'src/bin/run-tests.ts', 'src/test/integration/fixtures', '--reporter', 'json', '--output', '../unsafe-results.json'], { encoding: 'utf8' });
      expect(result.stdout + result.stderr).to.contain('Security Error');
    }
  }
});
