## 2026-03-15 - [Path Traversal in Fixture Utilities]
**Vulnerability:** The `assertFixture`, `createFixture`, and `readFixture` functions in `src/lib/fixture-utils.ts` allowed reading or writing files outside the intended `fixtures/` directory via relative path traversal (e.g., `../../../package.json`).
**Learning:** `path.join` and `path.resolve` do not prevent traversal; validation using `path.relative` to ensure the final path remains within the base directory is required.
**Prevention:** Always validate resolved file paths against a whitelist or a base directory using `path.relative` and checking for leading `..` before performing file operations.
