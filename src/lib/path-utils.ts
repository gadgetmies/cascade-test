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
 * Checks if a path is safe to use (e.g., within the current working directory).
 * This prevents path traversal attacks and accidental deletion of critical directories.
 */
export function isPathSafe(targetPath: string, baseDir: string = process.cwd()): boolean {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(baseDir, targetPath);

  const relative = path.relative(resolvedBase, resolvedTarget);

  // If the path is empty, it means target equals base, which we consider unsafe for operations like rmSync
  if (!relative) {
    return false;
  }

  // Check if the path goes outside the base directory
  const isOutside = relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative);

  return !isOutside;
}
