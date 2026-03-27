import { assertFixture, readFixture } from './src/lib/fixture-utils.js';
import * as fs from 'fs';
import * as path from 'path';

// This script should be run from the root of the repo
// We'll try to read package.json using path traversal in readFixture

try {
    // package.json is in the root.
    // From src/test/integration/ (where a test might live), fixtures is src/test/integration/fixtures
    // To get to package.json: ../../../package.json

    // We need to simulate being called from a test file.
    // fixture-utils uses stack trace to find the caller file.

    console.log("Attempting path traversal to read package.json...");
    const data = readFixture('../../../package.json', { fixturesDir: 'fixtures' });
    console.log("Successfully read package.json via traversal!");
    console.log("First few chars:", JSON.stringify(data).substring(0, 50));
} catch (error) {
    console.log("Caught expected error or failed:", error.message);
}
