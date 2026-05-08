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
 * Prevents path traversal and ensuring the target is not the base directory itself.
 */
export function isPathSafe(baseDir: string, targetPath: string): boolean {
  try {
    const resolvedBase = path.resolve(baseDir);
    const resolvedTarget = path.resolve(resolvedBase, targetPath);

    const relative = path.relative(resolvedBase, resolvedTarget);

    // Path is safe if:
    // 1. It's not empty (which would mean it's the base directory itself)
    // 2. It doesn't start with '..' (which would mean it's outside the base directory)
    // 3. It's not an absolute path (which can happen on some OS/Node versions if they are on different drives)
    return (
      relative !== "" &&
      !relative.startsWith("..") &&
      !path.isAbsolute(relative)
    );
  } catch {
    // If path resolution fails, assume it's unsafe
    return false;
  }
}
