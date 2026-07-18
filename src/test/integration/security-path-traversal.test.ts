import { spawnSync } from 'child_process';
import { test } from '../../index.js';
import { expect } from 'chai';

test({
  'Security Path Traversal': () => {
    const run = (args: string[]) => spawnSync(process.execPath, ['--import', 'tsx', 'src/bin/run-tests.ts', 'src/test/integration/fixtures', ...args], { encoding: 'utf-8' });
    expect(run(['-o', '../outside.json']).stderr).to.include('Security Error: Output path');
    expect(run(['--coverage', '--coverage-dir', '../outside']).stderr).to.include('Security Error: Coverage directory');
    expect(run(['--coverage', '--coverage-dir', '.']).stderr).to.include('Security Error: Cannot use CWD');
  }
});
