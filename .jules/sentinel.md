## 2026-05-21 - [HIGH] Path Traversal in Coverage and Reporters
**Vulnerability:** The CLI options `--coverage-dir` and `--output` allowed arbitrary directory deletion/writing by not validating that the provided paths were within the current working directory. Similarly, fixture utilities allowed path traversal via fixture names.
**Learning:** `path.resolve` alone does not prevent directory traversal. Effective mitigation requires resolving the target path against the intended base directory and then verifying that the resulting relative path does not start with `..`.
**Prevention:** Always use a centralized validation utility (like `isPathSafe`) when handling user-provided file paths to ensure they stay within expected boundaries.
