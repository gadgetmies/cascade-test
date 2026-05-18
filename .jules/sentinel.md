## 2026-05-18 - Path Traversal Prevention
**Vulnerability:** Command-line options like `--coverage-dir` and `--output`, as well as fixture names in `assertFixture`, allowed arbitrary directory traversal and file writing/deletion.
**Learning:** Utilities that interact with the file system based on user-provided names must explicitly validate those paths against a safe base directory. Even internal "fixture" utilities can be a risk if test definitions are influenced by external input.
**Prevention:** Use a robust `isPathSafe` utility that resolves paths and checks `path.relative` for '..' prefixes, absolute results, or equality with the base directory before performing any `fs` operations.
