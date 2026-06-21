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
 * Checks if a target path is safe (stays within a base directory)
 * @param baseDir The base directory that should contain the target path
 * @param targetPath The path to check
 * @returns true if the path is safe, false otherwise
 */
export function isPathSafe(baseDir: string, targetPath: string): boolean {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(baseDir, targetPath);
  const relative = path.relative(resolvedBase, resolvedTarget);

  // A path is safe if it's the base directory itself or a sub-path that doesn't go up
  // We also check for absolute paths in the relative result to handle Windows cross-drive cases
  return (relative === "" || (!relative.startsWith(".." + path.sep) && relative !== "..")) && !path.isAbsolute(relative);
}
