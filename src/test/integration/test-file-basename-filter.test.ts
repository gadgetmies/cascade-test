import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import * as path from 'path';
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
  },
});
