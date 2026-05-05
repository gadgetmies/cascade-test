# SENTINEL'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2026-03-15 - [CRITICAL] Path Traversal in Fixture Utils and Arbitrary Directory Deletion in Test Runner
**Vulnerability:**
1. `src/lib/fixture-utils.ts` allowed `fixtureName` to include `..` or be an absolute path, enabling access to files outside the intended fixtures directory.
2. `src/bin/run-tests.ts` called `fs.rmSync` on the provided coverage directory without validating that the path was within the project's root, potentially allowing deletion of arbitrary system directories if the process had sufficient permissions.

**Learning:**
1. `path.join` and `path.resolve` can easily lead to path traversal if the resulting path is not validated against a base directory using `path.relative`.
2. Even "temporary" or "output" directories provided by user configuration (like coverage) should be validated before performing destructive operations like `fs.rmSync`.

**Prevention:**
1. Always use `path.relative(baseDir, resolvedPath)` to verify that the resolved path is still within the `baseDir` by checking if the result starts with `..`.
2. Reject absolute paths for relative sub-resource identifiers.
3. Validate all user-provided paths before use in filesystem operations.
