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
 * Prevents path traversal and operations on the base directory itself.
 */
export function isPathSafe(targetPath: string, baseDir: string = process.cwd()): boolean {
  try {
    const resolvedBase = path.resolve(baseDir);
    const resolvedTarget = path.resolve(targetPath);

    const relative = path.relative(resolvedBase, resolvedTarget);

    // Block if:
    // 1. Target is the same as base (relative is empty)
    // 2. Target is outside base (starts with ..)
    // 3. Target is absolute (on Windows, relative might be absolute if on different drive)
    if (!relative ||
        relative === '..' ||
        relative.startsWith('..' + path.sep) ||
        path.isAbsolute(relative)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
