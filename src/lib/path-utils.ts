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
 * Validates that a path is safe (within the base directory and not the base directory itself)
 * to prevent directory traversal and accidental operations on the working directory.
 */
export function isPathSafe(targetPath: string, baseDir: string = process.cwd()): boolean {
  try {
    const resolvedPath = path.resolve(baseDir, targetPath);
    const relative = path.relative(baseDir, resolvedPath);

    // Check if it's the base directory itself (relative is empty)
    if (relative === '') {
      return false;
    }

    // Check if it's outside the base directory
    const isOutside = relative.startsWith('..' + path.sep) || relative === '..' || path.isAbsolute(relative);

    return !isOutside;
  } catch {
    return false;
  }
}
