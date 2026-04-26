## 2026-04-24 - Fix arbitrary directory deletion via coverage-dir
**Vulnerability:** Arbitrary directory deletion via user-controlled `--coverage-dir` option. The test runner would `rmSync` the directory before starting coverage.
**Learning:** Tools that perform cleanup before execution are dangerous when paths are user-controlled. `path.resolve` and `path.join` do not prevent traversal.
**Prevention:** Always validate resolved paths against a base directory using `path.relative` and check for `..` or absolute paths.
