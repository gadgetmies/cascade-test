import { test } from '../../index.js';
import { spawn } from 'child_process';
import * as path from 'path';
import { expect } from 'chai';
import { assertFixture } from '../../lib/fixture-utils.js';

test({
  'Security Path Validation': {
    'CLI: should block coverage directory outside CWD': async () => {
      return new Promise((resolve) => {
        const runTests = path.resolve('src/bin/run-tests.ts');
        const child = spawn('npx', ['tsx', runTests, 'src/test/examples', '--coverage', '--coverage-dir', '../unsafe-coverage'], {
          env: { ...process.env }
        });

        let stderr = '';
        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('exit', (code) => {
          try {
            expect(code).to.not.equal(0);
            expect(stderr).to.contain('Security Error: Coverage directory \'../unsafe-coverage\' is outside the current working directory or points to it.');
            resolve(null);
          } catch (e) {
            resolve((e as Error).message);
          }
        });
      });
    },

    'CLI: should block coverage directory as CWD': async () => {
      return new Promise((resolve) => {
        const runTests = path.resolve('src/bin/run-tests.ts');
        const child = spawn('npx', ['tsx', runTests, 'src/test/examples', '--coverage', '--coverage-dir', '.'], {
          env: { ...process.env }
        });

        let stderr = '';
        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('exit', (code) => {
          try {
            expect(code).to.not.equal(0);
            expect(stderr).to.contain('Security Error: Coverage directory \'.\' is outside the current working directory or points to it.');
            resolve(null);
          } catch (e) {
            resolve((e as Error).message);
          }
        });
      });
    },

    'CLI: should block output file outside CWD': async () => {
        return new Promise((resolve) => {
          const runTests = path.resolve('src/bin/run-tests.ts');
          const child = spawn('npx', ['tsx', runTests, 'src/test/examples', '--reporter', 'json', '--output', '../unsafe-output.json'], {
            env: { ...process.env }
          });

          let stderr = '';
          child.stderr.on('data', (data) => {
            stderr += data.toString();
          });

          child.on('exit', (code) => {
            try {
              expect(code).to.not.equal(0);
              expect(stderr).to.contain('Security Error: Output file \'../unsafe-output.json\' is outside the current working directory or points to it.');
              resolve(null);
            } catch (e) {
              resolve((e as Error).message);
            }
          });
        });
      },

    'Fixtures: should block fixturesDir outside CWD': () => {
      try {
        assertFixture('test.json', {}, { fixturesDir: '/etc' });
        return 'Should have thrown a security error';
      } catch (e) {
        if ((e as Error).message.includes('Security Error: Fixture directory')) {
          return null;
        }
        throw e;
      }
    },

    'Fixtures: should block fixtureName with traversal': () => {
      try {
        assertFixture('../../../etc/passwd', {}, { fixturesDir: 'fixtures' });
        return 'Should have thrown a security error';
      } catch (e) {
        if ((e as Error).message.includes('Security Error: Fixture path')) {
          return null;
        }
        throw e;
      }
    }
  }
});
