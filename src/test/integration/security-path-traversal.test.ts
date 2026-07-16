import { test } from '../../index.js';
import { spawnSync } from 'child_process';
import { expect } from 'chai';
test({
  'Security': () => {
    const { stderr } = spawnSync(process.execPath, ['--import', 'tsx', 'src/bin/run-tests.ts', 'src/test/integration/fixtures', '--output', '../unsafe.xml']);
    expect(stderr.toString()).to.include('Security Error');
  }
});
