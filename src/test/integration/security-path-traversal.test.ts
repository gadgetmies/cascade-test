import test from '../../lib/test.js';
import { assertFixture } from '../../lib/fixture-utils.js';
import { spawnSync } from 'child_process';
export default test({
  'Path Traversal Protection': {
    'fixture': () => {
      try { assertFixture('../o.json', {}); return 'Fail'; }
      catch (e: any) { if (!e.message.includes('Security Error')) return e.message; }
    },
    'cli': () => {
      const args = ['--import', 'tsx', 'src/bin/run-tests.ts', 'src/test/examples'];
      if (!spawnSync(process.execPath, [...args, '--coverage', '--coverage-dir', '..'], { encoding: 'utf8' }).stderr.includes('Security Error')) return 'Block traversal';
      if (!spawnSync(process.execPath, [...args, '--output', '../o.json'], { encoding: 'utf8' }).stderr.includes('Security Error')) return 'Block output';
    }
  }
});
