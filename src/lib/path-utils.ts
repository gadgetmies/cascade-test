import * as path from 'path';

export function getDisplayTestFile(testFile: string, basePath?: string): string {
  try {
    let actualPath = testFile;
    if (testFile.startsWith('file://')) {
      actualPath = testFile.replace('file://', '');
    }

    const relativeBase = basePath || process.cwd();
    return path.relative(relativeBase, actualPath);
  } catch {
    return testFile;
  }
}

/**
 * Validates if a target path is a safe subdirectory of a base directory.
 * Prevents directory traversal and operations on the base directory itself.
 */
export function isPathSafe(baseDir: string, targetPath: string): boolean {
  try {
    const resolvedBase = path.resolve(baseDir);
    const resolvedPath = path.resolve(resolvedBase, targetPath);

    const relative = path.relative(resolvedBase, resolvedPath);

    // Unsafe if:
    // 1. It points to a parent directory (starts with ..)
    // 2. It's an absolute path that escaped the base (though path.resolve usually prevents this if used with base)
    // 3. it's the base directory itself (empty string)
    if (
      relative === ".." ||
      relative.startsWith(".." + path.sep) ||
      path.isAbsolute(relative) ||
      relative === ""
    ) {
      return false;
    }

    return true;
  } catch {
    return false; // Fail secure
  }
}
