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
 * Validate if a target path is a safe subdirectory of a base directory
 * @param baseDir The base directory that the target path should be within
 * @param targetPath The path to validate
 * @returns boolean indicating if the path is safe
 */
export function isPathSafe(baseDir: string, targetPath: string): boolean {
  try {
    const resolvedBase = path.resolve(baseDir);
    const resolvedPath = path.resolve(targetPath);
    const relative = path.relative(resolvedBase, resolvedPath);

    // Path is safe if it's inside the base directory, not the base directory itself,
    // not traversing up, and not an absolute path after relative resolution.
    return (
      relative !== "" &&
      relative !== ".." &&
      !relative.startsWith(".." + path.sep) &&
      !path.isAbsolute(relative)
    );
  } catch {
    // If resolution fails, assume unsafe
    return false;
  }
}
