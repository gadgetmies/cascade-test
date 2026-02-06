# Async Waiting Examples

This test file demonstrates various patterns for testing asynchronous operations that require waiting for side effects to complete.

## Patterns Demonstrated

### 1. Eventually Pattern

Wait for a value to eventually equal an expected value through polling:

```typescript
await eventuallyEqual(() => ctx.counter.value, 10, { timeout: 1000, interval: 50 });
```

### 2. WaitFor Pattern

Wait for a predicate function to return true:

```typescript
await waitFor(
  () => ctx.counter.value >= 100,
  { timeout: 1000, timeoutMessage: 'Counter never reached 100' }
);
```

### 3. Event-Based Waiting

Wait for events to be emitted using promises:

```typescript
const eventPromise = new Promise<void>((resolve) => {
  ctx.eventEmitter.on('dataLoaded', (data: any) => {
    eventData = data;
    resolve();
  });
});

await Promise.race([
  eventPromise,
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Event not emitted in time')), 1000)
  ),
]);
```

### 4. Retry Pattern

Retry flaky operations with exponential backoff:

```typescript
const result = await retry(
  async () => {
    // potentially failing operation
    return await flakyOperation();
  },
  { maxAttempts: 5, delayMs: 50, backoff: true }
);
```

## Utility Functions Provided

### `eventually(checkFn, options)`

Polls a function until it returns a truthy value or times out.

**Options:**
- `timeout`: Maximum time to wait (default: 5000ms)
- `interval`: Polling interval (default: 50ms)
- `errorMessage`: Custom error message on timeout

### `waitFor(predicate, options)`

Waits for a predicate function to return true.

**Options:**
- `timeout`: Maximum time to wait (default: 5000ms)
- `interval`: Polling interval (default: 50ms)
- `timeoutMessage`: Custom timeout error message

### `eventuallyEqual(getValue, expected, options)`

Convenience wrapper around `eventually` for value equality checks.

### `retry(operation, options)`

Retries an operation with configurable backoff strategy.

**Options:**
- `maxAttempts`: Maximum number of attempts (default: 3)
- `delayMs`: Initial delay between attempts (default: 100ms)
- `backoff`: Use exponential backoff (default: true)

## Real-World Scenarios

The test includes practical examples of:

1. **API Polling** - Waiting for a long-running job to complete
2. **Database Transactions** - Waiting for multiple async operations to commit
3. **Cache Warm-up** - Ensuring all required data is loaded before proceeding
4. **Race Conditions** - Handling concurrent operations safely
5. **Parallel Operations** - Waiting for multiple async tasks to complete

## Usage in Your Tests

You can copy these utility functions into your test suites to handle common async waiting patterns. They provide:

- Clear, readable test code
- Configurable timeouts and polling intervals
- Descriptive error messages
- Type safety with TypeScript
- Works with any assertion library (Chai, Node assert, etc.)

## Running the Tests

```bash
npm run build
node dist/bin/run-tests.js dist/test/examples --regex async-waiting
```

All tests should pass, demonstrating that the async waiting patterns work correctly.




















