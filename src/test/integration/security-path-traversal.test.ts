import { test } from '../../index.js';
import { spawnSync } from 'child_process';
import { expect } from 'chai';

test({
  'Path Traversal Protections': {
    '--coverage-dir should be restricted to CWD': () => {
      const result = spawnSync('npx', ['tsx', 'src/bin/run-tests.ts', 'src/test/examples', '--coverage', '--coverage-dir', '../unsafe-coverage'], { encoding: 'utf8' });
      expect(result.stderr).to.include('Security Error: Coverage directory \'../unsafe-coverage\' is outside the current working directory.');
    },
    '--output should be restricted to CWD': () => {
      const result = spawnSync('npx', ['tsx', 'src/bin/run-tests.ts', 'src/test/examples', '--reporter=json', '--output', '../unsafe-output.json'], { encoding: 'utf8' });
      expect(result.stderr).to.include('Security Error: Output path \'../unsafe-output.json\' is outside the current working directory.');
    },
    'should not allow CWD as coverage directory': () => {
       const result = spawnSync('npx', ['tsx', 'src/bin/run-tests.ts', 'src/test/examples', '--coverage', '--coverage-dir', '.'], { encoding: 'utf8' });
      expect(result.stderr).to.include('Security Error: Cannot use current working directory as coverage directory.');
    }
  }
});
