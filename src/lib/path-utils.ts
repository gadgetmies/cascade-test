import * as path from 'path';

export function isPathSafe(targetPath: string, baseDir: string = process.cwd()): boolean {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(baseDir, targetPath);
  const relative = path.relative(resolvedBase, resolvedTarget);

  // Check if the path escapes the base directory
  // path.relative returns an absolute path if it's on a different drive on Windows
  if (path.isAbsolute(relative)) {
    return false;
  }

  return relative === "" || (!relative.startsWith(".." + path.sep) && relative !== "..");
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
