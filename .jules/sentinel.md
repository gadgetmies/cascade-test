## 2026-07-20 - [Path Traversal in Fixture Utility Paths]
**Vulnerability:** Unsanitized user inputs for fixture names allowed directory traversal outside the intended fixtures directory using relative path sequences (e.g. `..`).
**Learning:** Using `path.join` with relative user input is insufficient to prevent traversal; the final path must be normalized using `path.resolve` and verified via `path.relative` against the base directory.
**Prevention:** Always resolve the targeted path against the expected base directory and ensure the relative path from the base directory does not start with `..` and is not absolute.
