## 2026-04-24 - Coverage Directory Traversal Prevention
**Vulnerability:** The `--coverage-dir` option allowed arbitrary directory deletion because it would `rmSync` the directory before starting tests without validating if the path was safe (within the CWD and not the CWD itself).
**Learning:** `path.resolve` and `path.join` do not prevent directory traversal. Validation using `path.relative` is necessary to ensure a path remains within its intended boundary.
**Prevention:** Always validate user-provided filesystem paths using a utility like `isPathSafe` that checks the relative path for '..' prefixes, absolute resolutions, and empty strings (pointing to the root of the sandbox/CWD).
