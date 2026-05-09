## 2026-05-09 - Path Traversal in Coverage and Fixture Utilities
**Vulnerability:** CLI options like `--coverage-dir` allowed arbitrary directory deletion because the framework performed `fs.rmSync(config.coverage.directory, { recursive: true })` without validating if the path was safe. Similarly, fixture utilities could be coerced into reading/writing files outside the fixtures directory.
**Learning:** Functions like `path.join` and `path.resolve` do not prevent directory traversal if the input contains `..`. Even if paths are resolved, they can still point outside the intended root.
**Prevention:** Always validate resolved paths using `path.relative(baseDir, resolvedPath)`. A path is safe only if the relative path is not empty, does not start with `..`, and is not absolute.
