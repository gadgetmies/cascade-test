import * as path from 'path';

/**
 * Validate that a target path is a safe subdirectory of a base directory.
 * This prevents path traversal attacks.
 */
export function isPathSafe(baseDir: string, targetPath: string): boolean {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(resolvedBase, targetPath);

  const relative = path.relative(resolvedBase, resolvedTarget);

  // If relative is empty, it means target is the same as base.
  // We allow it to be the same or a sub-path.
  if (relative === "") {
    return true;
  }

  // Check if target is outside of base
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return false;
  }

  return true;
}

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
