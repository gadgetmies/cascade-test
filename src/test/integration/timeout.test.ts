import { test } from '../../index.js';
import { TestContext, TestResult } from '../../types.js';
import { runTestFile } from '../../lib/test-utils.js';
import { fileURLToPath } from 'url';
import * as path from 'path';
import * as fs from 'fs';
import { expect } from 'chai';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..'
);

const entryPath = path
  .resolve(projectRoot, 'src/index.ts')
  .replace(/\\/g, '\\\\');

const writeFixture = (tempDir: string, fileName: string, source: string): string => {
  const fixturePath = path.join(tempDir, fileName);
  fs.writeFileSync(fixturePath, source);
  return fixturePath;
};

test({
  setup: async (): Promise<TestContext> => ({ timeout: 30000 }),

  'Timeout handling': {
    setup: async (): Promise<TestContext> => {
      const tempDir = fs.mkdtempSync(
        path.join(projectRoot, '.tmp-cascade-timeout-')
      );
      return { tempDir };
    },

    teardown: async (ctx?: TestContext): Promise<void> => {
      if (ctx?.tempDir) {
        fs.rmSync(ctx.tempDir, { recursive: true, force: true });
      }
    },

    'marks a test case as failed when it exceeds the configured timeout': async (
      ctx?: TestContext
    ): Promise<void> => {
      const fixturePath = writeFixture(
        ctx!.tempDir,
        'case-timeout.test.ts',
        `
import { test } from '${entryPath}';

test({
  setup: async () => ({ timeout: 100 }),
  'Slow Cases': {
    'should fail when running past the timeout': async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
  },
});
`
      );

      const result = await runTestFile(fixturePath);

      expect(result.summary, 'expected summary file to be written').to.exist;
      expect(result.summary!.failed).to.equal(
        1,
        'expected the timed-out test to be reported as failed'
      );
      expect(result.summary!.passed).to.equal(0);
      expect(result.code).to.equal(1, 'expected exit code 1 on timeout');

      const failed = result.summary!.results.find(
        (r: TestResult) => r.status === 'failed'
      );
      expect(failed, 'expected a failed result').to.exist;
      expect(failed!.error, 'expected a non-empty error message').to.be.a(
        'string'
      ).and.not.empty;
      expect(failed!.error).to.match(
        /timed out after 100ms/i,
        'expected the failure message to mention the timeout'
      );
    },

    'marks a suite as failed when nested work exceeds the group timeout': async (
      ctx?: TestContext
    ): Promise<void> => {
      const fixturePath = writeFixture(
        ctx!.tempDir,
        'group-timeout.test.ts',
        `
import { test } from '${entryPath}';

test({
  setup: async () => ({ timeout: 150 }),
  'Slow Suite': {
    'first slow test': async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    },
    'second slow test': async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    },
  },
});
`
      );

      const result = await runTestFile(fixturePath);

      expect(result.summary, 'expected summary file to be written').to.exist;
      expect(result.code).to.equal(1, 'expected exit code 1 on timeout');
      expect(result.summary!.failed).to.be.greaterThan(
        0,
        'expected at least one failure when the suite times out'
      );

      const output = result.output;
      expect(output).to.match(
        /timed out after \d+ms/i,
        'expected timeout message to appear in the runner output'
      );
    },
  },
});
