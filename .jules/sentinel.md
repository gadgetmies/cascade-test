## 2025-01-24 - [Path Traversal in Fixture Utilities]
**Vulnerability:** The `readFixture` and `createFixture` functions in `src/lib/fixture-utils.ts` were vulnerable to path traversal. They used `path.join` with user-supplied fixture names without validating that the resulting path stayed within the intended fixtures directory. This allowed reading and writing arbitrary files on the system (e.g., `readFixture('../../../../package.json')`).

**Learning:** Path traversal is a common risk in utility functions that handle file system operations. Even if the tool is primarily for testing, it can be exploited if integrated into automated pipelines or if test configurations are partially untrusted. Standard mitigations like `path.relative` combined with `path.resolve` are effective but must be explicitly implemented.

**Prevention:** Always validate that resolved file paths are within the expected base directory. Use `path.resolve` to get the absolute path, then use `path.relative(baseDir, resolvedPath)` and check if the result starts with `..` or is an absolute path. Additionally, explicitly disallow absolute paths in inputs that are intended to be relative to a specific directory.
