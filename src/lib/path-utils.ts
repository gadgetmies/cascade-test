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
 * A path is considered safe if it's inside baseDir and not baseDir itself.
 */
export function isPathSafe(targetPath: string, baseDir: string): boolean {
  try {
    const resolvedPath = path.resolve(targetPath);
    const resolvedBase = path.resolve(baseDir);
    const relative = path.relative(resolvedBase, resolvedPath);

    // Path is unsafe if:
    // 1. It's an absolute path (if input was absolute, path.resolve keeps it absolute)
    // 2. It's the same as baseDir (relative is empty)
    // 3. It goes outside baseDir (starts with ..)
    // 4. It's an absolute path (can happen with path.relative on some systems/cases)
    if (path.isAbsolute(targetPath)) {
      return false;
    }

    return !(
      relative === "" ||
      relative === ".." ||
      relative.startsWith(".." + path.sep) ||
      path.isAbsolute(relative)
    );
  } catch {
    // If path resolution fails, assume unsafe
    return false;
  }
}
