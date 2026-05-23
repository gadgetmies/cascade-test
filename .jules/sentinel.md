## 2026-05-23 - [Path Traversal in CLI options]
**Vulnerability:** The `--coverage-dir` option allowed arbitrary directory deletion because `fs.rmSync(config.coverage.directory, { recursive: true, force: true })` was called without validating that the path is within the project's boundaries. Similarly, `--output` allowed writing files anywhere.
**Learning:** Even internal tools like test frameworks must validate path inputs from CLI to prevent accidental or malicious file system operations outside the project root. `path.resolve` alone does not prevent directory traversal.
**Prevention:** Use a helper like `isPathSafe` that checks if `path.relative(baseDir, resolvedTarget)` starts with `..` or is absolute or is empty (to prevent operating on the base directory itself).
