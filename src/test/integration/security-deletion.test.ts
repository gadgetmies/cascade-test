import { test } from "../../index.js";
import { spawnSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import os from 'os';

/**
 * Security test for coverage directory deletion
 * This test verifies that the test runner correctly blocks attempts to delete
 * directories outside the current working directory.
 */
test({
  'Security: Arbitrary directory deletion': async () => {
    const outsideDir = path.join(os.tmpdir(), 'cascade_security_test_' + Date.now());
  if (!fs.existsSync(outsideDir)) {
    fs.mkdirSync(outsideDir, { recursive: true });
  }
  const canaryFile = path.join(outsideDir, 'canary.txt');
  fs.writeFileSync(canaryFile, 'SAFE');

  try {
    // Run the test runner with a coverage-dir pointing to our temp directory
    // We use npx tsx to run the source directly, ensuring the latest code is tested
    // and maintaining independence from build artifacts in CI.
    const result = spawnSync('npx', [
      'tsx',
      'src/bin/run-tests.ts',
      'src/test/examples',
      '--coverage',
      '--coverage-dir',
      outsideDir
    ], { encoding: 'utf8' });

    // Verify that the canary file still exists
    if (!fs.existsSync(canaryFile)) {
      throw new Error('SECURITY VULNERABILITY: The directory outside the project root was deleted!');
    }

    // Verify that the security error was reported
    if (!result.stderr.includes('Security Error')) {
      throw new Error('Expected security error was not reported in stderr.');
    }

      // console.log('✓ Security: Arbitrary directory deletion correctly blocked');
      return; // Pass
    } catch (e: any) {
      return `Security test failed: ${e.message}`;
    } finally {
      // Cleanup
      if (fs.existsSync(outsideDir)) {
        fs.rmSync(outsideDir, { recursive: true, force: true });
      }
    }
  }
});
