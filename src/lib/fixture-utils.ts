import * as fs from "fs";
import * as path from "path";
import { FixtureConfig } from "../types.js";
import { diff } from "jest-diff";
import pkg from "lodash";
const { isEqual } = pkg;

/**
 * Default configuration for fixture operations
 */
const DEFAULT_CONFIG: Required<FixtureConfig> = {
  fixturesDir: "fixtures",
  updateFixtures: false,
  serializer: (data: any) => JSON.stringify(data, null, 2),
  deserializer: (data: string) => JSON.parse(data),
  normalize: (data: any) => data,
};

/**
 * Get the fixture directory path relative to the calling test file
 */
function getFixtureDir(callerFile: string, fixturesDir: string): string {
  // Handle file:// URLs
  let normalizedFile = callerFile;
  if (callerFile.startsWith("file://")) {
    normalizedFile = callerFile.replace("file://", "");
  }

  const testDir = path.dirname(normalizedFile);
  return path.resolve(testDir, fixturesDir);
}

function getFixturePath(
  callerFile: string,
  fixtureName: string,
  config: Required<FixtureConfig>
): string {
  const fixtureDir = getFixtureDir(callerFile, config.fixturesDir);
  return path.join(fixtureDir, fixtureName);
}

function ensureFixtureDirExists(fixturePath: string): void {
  const fixtureDir = path.dirname(fixturePath);
  if (!fs.existsSync(fixtureDir)) {
    fs.mkdirSync(fixtureDir, { recursive: true });
  }
}

function readFixtureFile(
  fixturePath: string,
  deserializer: (data: string) => any
): any {
  if (!fs.existsSync(fixturePath)) {
    throw new Error(`Fixture not found: ${fixturePath}`);
  }

  try {
    const content = fs.readFileSync(fixturePath, "utf8");
    return deserializer(content);
  } catch (error) {
    throw new Error(`Failed to read fixture ${fixturePath}: ${error}`);
  }
}

function writeFixture(
  fixturePath: string,
  data: any,
  serializer: (data: any) => string
): void {
  ensureFixtureDirExists(fixturePath);
  const content = serializer(data);
  fs.writeFileSync(fixturePath, content, "utf8");
}

function deepEqual(a: any, b: any, normalize?: (data: any) => any): { equal: boolean; diff?: string } {
  // Apply normalization if provided
  const normalizedA = normalize ? normalize(a) : a;
  const normalizedB = normalize ? normalize(b) : b;

  // Use lodash isEqual for reliable deep equality checking
  const areEqual = isEqual(normalizedA, normalizedB);
  
  if (areEqual) {
    return { equal: true };
  }
  
  // Values are not equal, use jest-diff to generate the diff
  const diffResult = diff(normalizedA, normalizedB);
  
  return { equal: false, diff: diffResult || "Values are different but no diff available" };
}

function mapCompiledToSource(compiledPath: string): string {
  // If we're in a dist directory, map it back to the src directory
  if (compiledPath.includes('/dist/')) {
    // Handle both .js files and .js:line:column patterns
    return compiledPath.replace('/dist/', '/src/').replace(/\.js(:\d+:\d+)?$/, '.ts$1');
  }
  return compiledPath;
}

function getCallerFile(): string {
  const stack = new Error().stack;
  if (!stack) {
    throw new Error("Unable to determine caller file");
  }

  const lines = stack.split("\n");
  // Skip the first few lines (Error, getCallerFile, and the fixture function)
  for (let i = 3; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("at ") && !line.includes("fixture-utils.ts")) {
      const match = line.match(/\(([^)]+)\)/) || line.match(/at ([^\s]+)/);
      if (match) {
        const filePath = match[1];
        let resolvedPath: string;
        
        if (filePath.startsWith("file://")) {
          resolvedPath = filePath;
        } else if (path.isAbsolute(filePath)) {
          resolvedPath = filePath;
        } else {
          resolvedPath = path.resolve(filePath);
        }
        
        // Map compiled path back to source path
        return mapCompiledToSource(resolvedPath);
      }
    }
  }

  throw new Error(
    `Unable to determine caller file from stack trace. Stack: ${stack}`
  );
}

/**
 * Assert that test data matches fixture content
 *
 * @param fixtureName - Name of the fixture file (e.g., 'expected-output.json')
 * @param testData - The data to compare against the fixture
 * @param config - Optional configuration for the assertion
 * @returns Promise<FixtureResult> - Result of the assertion
 *
 * @example
 * ```typescript
 * // Basic usage
 * const result = await assertFixture('expected-output.json', myData);
 * expect(result.passed).toBe(true);
 *
 * // Fixtures are automatically updated if UPDATE_FIXTURES environment variable is set
 * // Run with: UPDATE_FIXTURES=true npm test
 *
 * // With custom normalization
 * const result = await assertFixture('expected-output.json', myData, {
 *   normalize: (data) => ({
 *     ...data,
 *     timestamp: '[TIMESTAMP]',
 *     id: '[ID]'
 *   })
 * });
 * ```
 */
export function assertFixture(
  fixtureName: string,
  testData: any,
  config: FixtureConfig = {}
): void {
  const mergedConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };
  const updateFixtures = process.env["UPDATE_FIXTURES"] !== undefined;
  const callerFile = getCallerFile();
  const fixturePath = getFixturePath(callerFile, fixtureName, mergedConfig);

  // Normalize the test data for comparison and writing
  const normalizedTestData = mergedConfig.normalize
    ? mergedConfig.normalize(testData)
    : testData;

  if (updateFixtures) {
    writeFixture(fixturePath, normalizedTestData, mergedConfig.serializer);
  }

  const expectedData = readFixtureFile(fixturePath, mergedConfig.deserializer);

  const equalityResult = deepEqual(expectedData, normalizedTestData);

  if (!equalityResult.equal) {
    const errorMessage = `Fixture mismatch for ${fixtureName}. Set updateFixtures: true to update.`;
    const fullErrorMessage = equalityResult.diff 
      ? `${errorMessage}\n\nDiff:\n${equalityResult.diff}`
      : errorMessage;
    throw new Error(fullErrorMessage);
  }
}

/**
 * Create or update a fixture file
 *
 * @param fixtureName - Name of the fixture file
 * @param data - The data to store in the fixture
 * @param config - Optional configuration
 * @returns Promise<string> - Path to the created/updated fixture
 *
 * @example
 * ```typescript
 * // Create a new fixture
 * const fixturePath = await createFixture('my-data.json', { key: 'value' });
 *
 * // Create fixture with custom serializer
 * const fixturePath = await createFixture('my-data.yaml', data, {
 *   serializer: (data) => yaml.stringify(data)
 * });
 * ```
 */
export function createFixture(
  fixtureName: string,
  data: any,
  config: FixtureConfig = {}
): string {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const callerFile = getCallerFile();
  const fixturePath = getFixturePath(callerFile, fixtureName, mergedConfig);

  writeFixture(fixturePath, data, mergedConfig.serializer);
  return fixturePath;
}

/**
 * Read fixture content
 *
 * @param fixtureName - Name of the fixture file
 * @param config - Optional configuration
 * @returns Promise<any> - The fixture content
 *
 * @example
 * ```typescript
 * // Read a JSON fixture
 * const data = await readFixture('expected-output.json');
 *
 * // Read a YAML fixture
 * const data = await readFixture('config.yaml', {
 *   deserializer: (content) => yaml.parse(content)
 * });
 * ```
 */
export function readFixture(
  fixtureName: string,
  config: FixtureConfig = {}
): any {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const callerFile = getCallerFile();
  const fixturePath = getFixturePath(callerFile, fixtureName, mergedConfig);

  return readFixtureFile(fixturePath, mergedConfig.deserializer);
}

/**
 * Utility function to create a fixture config for JSON fixtures with common normalizations
 *
 * @param normalizations - Object with keys to normalize and their replacement values
 * @returns FixtureConfig with normalization function
 *
 * @example
 * ```typescript
 * // Normalize timestamps and IDs
 * const result = await assertFixture('output.json', data, normalizeConfig({
 *   timestamp: '[TIMESTAMP]',
 *   id: '[ID]',
 *   duration: '[DURATION]'
 * }));
 * ```
 */
export function normalizeConfig(
  normalizations: Record<string, any>
): FixtureConfig {
  return {
    normalize: (data: any) => {
      if (typeof data !== "object" || data === null) {
        return data;
      }

      if (Array.isArray(data)) {
        return data.map((item) =>
          normalizeConfig(normalizations).normalize!(item)
        );
      }

      const normalized = { ...data };

      // Handle nested property paths (e.g., 'user.createdAt')
      for (const [path, replacement] of Object.entries(normalizations)) {
        if (path.includes(".")) {
          const keys = path.split(".");
          let current = normalized;

          // Navigate to the parent object
          for (let i = 0; i < keys.length - 1; i++) {
            if (current && typeof current === "object" && keys[i] in current) {
              current = current[keys[i]];
            } else {
              current = null;
              break;
            }
          }

          // Set the final property
          if (current && typeof current === "object") {
            const finalKey = keys[keys.length - 1];
            current[finalKey] = replacement;
          }
        } else {
          // Handle direct properties
          if (path in normalized) {
            normalized[path] = replacement;
          }
        }
      }

      // Recursively normalize nested objects
      for (const [key, value] of Object.entries(normalized)) {
        if (typeof value === "object" && value !== null) {
          normalized[key] = normalizeConfig(normalizations).normalize!(value);
        }
      }

      return normalized;
    },
  };
}
