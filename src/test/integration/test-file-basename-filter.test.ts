import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import * as path from 'path';
import * as fs from 'fs';
import { test } from '../../index.js';
import { TestContext } from '../../types.js';
import { expect } from 'chai';
import {
  filterTestPathsByBasenameRegex,
  filterTestPathsByBasenameGlob,
} from '../../lib/file-utils.js';
import { forkExecArgvForScript } from '../../lib/fork-ts-script.js';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..'
);

function runTestsCli(args: string[]): ReturnType<typeof spawnSync> {
  return spawnSync(
    process.execPath,
    ['--import', 'tsx', 'src/bin/run-tests.ts', ...args],
    { cwd: projectRoot, encoding: 'utf-8' }
  );
}

test({
  setup: async (): Promise<TestContext> => ({}),

  'CLI basename filters and fork exec argv': {
    'filterTestPathsByBasenameRegex keeps matching basenames': (): void => {
      const paths = [
        '/x/framework.test.js',
        '/x/cli-args.test.js',
        '/y/other.js',
      ];
      const filtered = filterTestPathsByBasenameRegex(
        paths,
        /^framework\.test\.js$/
      );
      expect(filtered).to.deep.equal(['/x/framework.test.js']);
    },

    'filterTestPathsByBasenameGlob matches basenames with minimatch': (): void => {
      const paths = ['/x/framework.test.js', '/x/cli-args.test.js'];
      expect(
        filterTestPathsByBasenameGlob(paths, 'framework.test.js')
      ).to.deep.equal(['/x/framework.test.js']);
      expect(filterTestPathsByBasenameGlob(paths, 'framework.test')).to.deep.equal(
        []
      );
      expect(filterTestPathsByBasenameGlob(paths, '*.test.js')).to.deep.equal(
        paths
      );
    },

    'forkExecArgvForScript uses tsx for any .ts path': (): void => {
      expect(forkExecArgvForScript('/proj/foo.test.ts')).to.deep.equal([
        '--import',
        'tsx',
      ]);
      expect(forkExecArgvForScript('/proj/foo.d.ts')).to.deep.equal([
        '--import',
        'tsx',
      ]);
      expect(forkExecArgvForScript('/proj/foo.test.js')).to.deep.equal([]);
    },

    'CLI exits with code 1 when --regex matches no files': (): void => {
      const r = runTestsCli(['src/test/integration', '--regex', '^nomatch$']);
      expect(r.status).to.equal(1);
      expect(`${r.stderr ?? ''}${r.stdout ?? ''}`).to.match(
        /No test files matched/
      );
    },

    'CLI exits with code 1 when --glob matches no files': (): void => {
      const r = runTestsCli(['src/test/integration', '--glob', 'nomatch-*']);
      expect(r.status).to.equal(1);
      expect(`${r.stderr ?? ''}${r.stdout ?? ''}`).to.match(
        /No test files matched/
      );
    },

    'CLI runs a single test case and still executes setup/teardown': (): void => {
      const r = runTestsCli([
        'src/test/examples',
        '--glob',
        'basic.test.ts',
        '--test',
        'Basic Tests > should pass simple assertion',
      ]);
      expect(r.status).to.equal(0);
      expect(`${r.stdout ?? ''}`).to.include('Setting up basic tests...');
      expect(`${r.stdout ?? ''}`).to.include('Cleaning up basic tests...');
      expect(`${r.stdout ?? ''}`).to.match(/Total:\s+1/);
      expect(`${r.stdout ?? ''}`).to.match(/Passed:\s+1/);
      expect(`${r.stdout ?? ''}`).to.match(/Failed:\s+0/);
    },

    'CLI exits with code 1 when --test matches no test cases': (): void => {
      const r = runTestsCli([
        'src/test/examples',
        '--glob',
        'basic.test.ts',
        '--test',
        '^definitely-no-match$',
      ]);
      expect(r.status).to.equal(1);
      expect(`${r.stderr ?? ''}${r.stdout ?? ''}`).to.match(
        /No test cases matched/
      );
    },

    'CLI reports setup crashes in forked process as execution errors': (): void => {
      const tempDir = fs.mkdtempSync(path.join(projectRoot, '.tmp-cascade-setup-crash-'));
      const fixturePath = path.join(tempDir, 'setup-crash.test.ts');
      const entryPath = path
        .resolve(projectRoot, 'src/index.ts')
        .replace(/\\/g, '\\\\');

      const fixtureSource = `
import { test } from '${entryPath}';

test({
  setup: () => {
    setTimeout(() => {
      throw new Error('uncaught setup crash');
    }, 0);
    return {};
  },
  'will never complete': async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  },
});
`;
      fs.writeFileSync(fixturePath, fixtureSource);

      try {
        const r = runTestsCli([path.relative(projectRoot, tempDir)]);
        const output = `${r.stderr ?? ''}${r.stdout ?? ''}`;
        expect(r.status).to.equal(1);
        expect(output).to.match(/TEST FILE EXECUTION ERROR\(S\)/);
        expect(output).to.not.match(/0 FAILED TEST CASES/);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    },
  },
});
