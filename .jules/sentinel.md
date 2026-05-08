## 2026-05-06 - Path Traversal in Fixture Utilities
**Vulnerability:** The `assertFixture` and `createFixture` functions in `fixture-utils.ts` allowed arbitrary file writes via path traversal in the `fixtureName` parameter when `UPDATE_FIXTURES` was enabled.
**Learning:** `path.join` and `path.resolve` do not inherently prevent traversal if the input contains `..` segments that escape the intended base directory.
**Prevention:** Implement a robust path validation utility using `path.relative` to ensure the resolved target path remains within the intended base directory and is not the base directory itself.
