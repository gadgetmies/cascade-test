# Sentinel's Journal 🛡️

## 2026-04-11 - Path Traversal in Fixture Utilities
**Vulnerability:** The `fixture-utils.ts` functions (`createFixture`, `readFixture`, `assertFixture`) were vulnerable to path traversal. A malicious test or user-provided input could use `..` in a fixture name to read or write files outside the intended `fixtures` directory.
**Learning:** Using `path.join(baseDir, userInput)` is not enough to prevent directory traversal. `path.resolve` or `path.join` will happily resolve `..` segments that go above the `baseDir`.
**Prevention:** Always resolve the final path and use `path.relative(baseDir, resolvedPath)` to check if the result starts with `..` or is absolute (indicating it escaped the base directory).
