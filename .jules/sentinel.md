## 2026-06-06 - [Path Traversal Protection]
**Vulnerability:** Path traversal in CLI arguments (--coverage-dir, --output) and fixture utilities. The runner would recursively delete directories specified in --coverage-dir without validation.
**Learning:** Standard path joining (path.join, path.resolve) does not prevent escaping the intended base directory if user-controlled input contains ".." segments.
**Prevention:** Always validate resolved paths using a helper like `isPathSafe` which checks that the relative path from the base directory to the target does not start with ".." and is not absolute.
