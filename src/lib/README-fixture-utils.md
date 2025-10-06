# Fixture Utility

A comprehensive test utility for storing and asserting that test results match fixture contents. This utility makes it easy to create, update, and validate test fixtures with support for automatic updates via environment variables.

## Features

- **Automatic fixture creation**: Create fixtures automatically when they don't exist
- **Environment-controlled updates**: Update fixtures using environment variables
- **Data normalization**: Normalize dynamic data (timestamps, IDs, etc.) before comparison
- **Multiple formats**: Support for JSON, YAML, or any custom format via serializers
- **Deep comparison**: Comprehensive deep equality checking for complex data structures
- **TypeScript support**: Full TypeScript support with proper type definitions

## Basic Usage

### Simple Fixture Assertion

```typescript
import { assertFixture } from './lib/fixture-utils.js';

test('should match fixture data', async () => {
  const testData = {
    name: 'John Doe',
    email: 'john@example.com',
    age: 30
  };

  const result = await assertFixture('user.json', testData);
  expect(result.passed).toBe(true);
});
```

### Environment-Controlled Updates

```typescript
import { assertFixture } from './lib/fixture-utils.js';

test('should update fixture when needed', async () => {
  const testData = {
    timestamp: new Date().toISOString(),
    id: Math.random().toString(36)
  };

  // Fixtures will be updated automatically if UPDATE_FIXTURES environment variable is set
  const result = await assertFixture('dynamic-data.json', testData);
  
  if (process.env.UPDATE_FIXTURES !== undefined) {
    expect(result.updated).toBe(true);
  }
});
```

Run with fixture updates:
```bash
UPDATE_FIXTURES=true npm test
```

### Data Normalization

```typescript
import { assertFixture, normalizeConfig } from './lib/fixture-utils.js';

test('should normalize dynamic data', async () => {
  const testData = {
    timestamp: new Date().toISOString(),
    id: 'unique-id-123',
    duration: 1500,
    user: {
      name: 'John Doe',
      createdAt: new Date().toISOString()
    }
  };

  const result = await assertFixture('normalized-data.json', testData, 
    normalizeConfig({
      timestamp: '[TIMESTAMP]',
      id: '[ID]',
      duration: '[DURATION]',
      'user.createdAt': '[TIMESTAMP]'
    })
  );

  expect(result.passed).toBe(true);
});
```

## API Reference

### `assertFixture(fixtureName, testData, config?)`

Asserts that test data matches fixture content.

**Parameters:**
- `fixtureName` (string): Name of the fixture file
- `testData` (any): The data to compare against the fixture
- `config` (FixtureConfig, optional): Configuration options

**Returns:** `Promise<FixtureResult>`

**Example:**
```typescript
const result = await assertFixture('output.json', myData);
if (!result.passed) {
  throw new Error(result.error);
}
```

### `createFixture(fixtureName, data, config?)`

Creates or updates a fixture file.

**Parameters:**
- `fixtureName` (string): Name of the fixture file
- `data` (any): The data to store in the fixture
- `config` (FixtureConfig, optional): Configuration options

**Returns:** `Promise<string>` - Path to the created fixture

**Example:**
```typescript
const fixturePath = await createFixture('config.json', { version: '1.0.0' });
```

### `readFixture(fixtureName, config?)`

Reads fixture content from file.

**Parameters:**
- `fixtureName` (string): Name of the fixture file
- `config` (FixtureConfig, optional): Configuration options

**Returns:** `Promise<any>` - The fixture content

**Example:**
```typescript
const data = await readFixture('expected-output.json');
```


### `normalizeConfig(normalizations)`

Creates a configuration with data normalization.

**Parameters:**
- `normalizations` (Record<string, any>): Object with keys to normalize and their replacement values

**Returns:** `FixtureConfig`

**Example:**
```typescript
const result = await assertFixture('output.json', data, normalizeConfig({
  timestamp: '[TIMESTAMP]',
  id: '[ID]'
}));
```

## Configuration Options

### `FixtureConfig`

```typescript
interface FixtureConfig {
  /** Base directory for fixtures (defaults to 'fixtures' relative to test file) */
  fixturesDir?: string;
  /** Whether to update fixtures when they don't match (defaults to false) */
  updateFixtures?: boolean;
  /** Custom serializer for data (defaults to JSON.stringify with 2-space indentation) */
  serializer?: (data: any) => string;
  /** Custom deserializer for data (defaults to JSON.parse) */
  deserializer?: (data: string) => any;
  /** Whether to normalize data before comparison (e.g., sort arrays, remove timestamps) */
  normalize?: (data: any) => any;
}
```

## Advanced Usage

### Custom Serializers

```typescript
import yaml from 'js-yaml';

const result = await assertFixture('config.yaml', data, {
  serializer: (data) => yaml.dump(data),
  deserializer: (content) => yaml.load(content)
});
```

### Custom Fixture Directory

```typescript
const result = await assertFixture('output.json', data, {
  fixturesDir: 'test-fixtures'
});
```

### Complex Normalization

```typescript
const result = await assertFixture('api-response.json', data, {
  normalize: (data) => {
    // Sort arrays by id
    if (data.items && Array.isArray(data.items)) {
      data.items.sort((a, b) => a.id - b.id);
    }
    
    // Remove timestamps
    delete data.timestamp;
    delete data.generated;
    
    return data;
  }
});
```

## Best Practices

1. **Use environment variables for updates**: The utility automatically checks for the `UPDATE_FIXTURES` environment variable to control fixture updates.

2. **Normalize dynamic data**: Use `normalizeConfig()` to handle timestamps, IDs, and other dynamic values.

3. **Organize fixtures**: Keep fixtures in a dedicated `fixtures` directory relative to your test files.

4. **Version control**: Commit fixture files to version control to ensure consistent test results across environments.

5. **Document fixtures**: Add comments to fixture files explaining what they represent and when they should be updated.

## Integration with Test Frameworks

This utility works with any test framework that supports async/await:

- **Jest**: Use with `test()` and `expect()`
- **Mocha**: Use with `it()` and `assert()`
- **Custom frameworks**: Use with any test runner

## Error Handling

The utility provides detailed error messages when fixtures don't match:

```typescript
const result = await assertFixture('output.json', data);
if (!result.passed) {
  console.error(`Fixture mismatch: ${result.error}`);
  console.error(`Fixture path: ${result.fixturePath}`);
}
```

## File Structure

```
src/
├── test/
│   ├── my-test.spec.ts
│   └── fixtures/
│       ├── user-data.json
│       ├── api-response.json
│       └── config.yaml
└── lib/
    └── fixture-utils.ts
```

The utility automatically creates the `fixtures` directory if it doesn't exist and places fixture files relative to the test file location.
