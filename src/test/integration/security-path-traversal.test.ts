import { spawnSync } from 'child_process';
import { test } from '../../index.js';
import { expect } from 'chai';
import * as path from 'path';

test({
  'Path Traversal Security': {
    'should block output path outside CWD': () => {
      const result = spawnSync(process.execPath, [
        '--import', 'tsx',
        'src/bin/run-tests.ts',
        'src/test/integration',
        '--reporter', 'json',
        '--output', '../outside.json'
      ], { encoding: 'utf8' });

      expect(result.stderr).to.contain('Security Error: Output path \'../outside.json\' is outside the current working directory.');
      expect(result.status).to.equal(1);
    },

    'should block coverage directory outside CWD': () => {
      const result = spawnSync(process.execPath, [
        '--import', 'tsx',
        'src/bin/run-tests.ts',
        'src/test/integration',
        '--coverage',
        '--coverage-dir', '/tmp/unsafe-coverage'
      ], { encoding: 'utf8' });

      expect(result.stderr).to.contain('Security Error: Coverage directory \'/tmp/unsafe-coverage\' is outside the current working directory.');
      expect(result.status).to.equal(1);
    }
  }
});
