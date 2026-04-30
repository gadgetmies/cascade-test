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
 * Prevents directory traversal and ensures the path is relative to the base.
 */
export function isPathSafe(baseDir: string, targetPath: string): boolean {
  try {
    if (path.isAbsolute(targetPath)) {
      return false;
    }

    const resolvedPath = path.resolve(baseDir, targetPath);
    const relative = path.relative(baseDir, resolvedPath);

    // Check if the path is outside the base directory
    if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) {
      return false;
    }

    // Also check if it's the base directory itself (we might want to prevent deleting the base dir)
    if (relative === '') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
