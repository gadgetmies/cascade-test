## 2026-03-15 - [CRITICAL] Path Traversal in Fixture Utilities
**Vulnerability:** The `fixture-utils.ts` module was susceptible to path traversal because it used `path.join` on user-provided input without validating that the resulting path remained within the intended `fixturesDir`.

**Learning:** `path.join` and `path.resolve` do not prevent traversal; they merely resolve the final path. If the input contains `..`, the resolved path can escape the intended base directory.

**Prevention:** Always validate resolved paths using `path.relative(baseDir, resolvedPath)`. Check if the relative path starts with `..` or is an absolute path. Additionally, explicitly block absolute paths for user-provided filenames when they are intended to be relative to a base directory.
