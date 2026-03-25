## 2026-03-15 - [Path Traversal in Fixture Utilities]
**Vulnerability:** The `getFixturePath` function in `src/lib/fixture-utils.ts` did not validate that resolved fixture paths remained within the intended `fixturesDir`. It also allowed absolute paths. This could enable reading/writing files anywhere on the file system.
**Learning:** `path.join` and `path.resolve` do not prevent traversal; they only resolve it. Validation with `path.relative` is necessary to ensure the result is within the expected base directory.
**Prevention:** Always validate resolved paths against a base directory using `path.relative` and check if the result starts with `..` or is an absolute path. Explicitly block absolute input when only relative paths are expected.
