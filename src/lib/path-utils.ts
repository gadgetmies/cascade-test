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
 * Checks if a target path is a safe subdirectory of a base directory.
 * It prevents path traversal and ensures the target is within the base.
 * It also blocks cases where the target is the same as the base to prevent accidental operations on root.
 *
 * @param targetPath The path to check for safety
 * @param baseDir The base directory that the target path should be within (defaults to process.cwd())
 * @returns true if the path is safe, false otherwise
 */
export function isPathSafe(targetPath: string, baseDir: string = process.cwd()): boolean {
  try {
    const resolvedBase = path.resolve(baseDir);
    const resolvedTarget = path.resolve(targetPath);

    const relative = path.relative(resolvedBase, resolvedTarget);

    // Check if it's outside the base directory
    if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) {
      return false;
    }

    // Block if it's exactly the base directory
    if (relative === '') {
      return false;
    }

    return true;
  } catch {
    // If any path resolution fails, assume it's unsafe (fail secure)
    return false;
  }
}
