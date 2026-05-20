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
 * Validates that a target path is a safe subdirectory of a base directory.
 * This prevents path traversal attacks and ensures operations stay within intended boundaries.
 * Returns false if the path is outside the base directory or is the base directory itself.
 */
export function isPathSafe(baseDir: string, targetPath: string): boolean {
  try {
    const resolvedBase = path.resolve(baseDir);
    const resolvedPath = path.resolve(targetPath);

    const relative = path.relative(resolvedBase, resolvedPath);

    // Block traversal (..), absolute paths (if path.relative returns one), and the base directory itself
    const isOutside = relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative);
    const isSameAsBase = relative === '';

    return !isOutside && !isSameAsBase;
  } catch {
    // If anything goes wrong during resolution, fail secure
    return false;
  }
}
