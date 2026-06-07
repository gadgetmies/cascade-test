## 2026-06-07 - [Path Traversal in CLI and Fixtures]
**Vulnerability:** The `--coverage-dir` and `--output` CLI options, along with the fixture utility, were susceptible to path traversal. Additionally, `--coverage-dir=.` could cause the framework to delete the current working directory during its cleanup phase.
**Learning:** Standard path functions like `path.join` and `path.resolve` do not prevent escaping intended directory boundaries. Cleanup operations (`fs.rmSync`) are particularly dangerous when the target path is user-controlled.
**Prevention:** Implement a robust `isPathSafe` utility that uses `path.relative` to ensure the resolved target path is a strict subdirectory of the intended base directory. Always validate paths before any file system write or delete operations.
