import * as path from 'path';

export function isPathSafe(baseDir: string, targetPath: string): boolean {
  try {
    const resolvedBase = path.resolve(baseDir);
    const resolvedPath = path.resolve(targetPath);

    const relative = path.relative(resolvedBase, resolvedPath);

    // Must not be empty (same as base), must not start with .. (outside base), must not be absolute
    if (
      relative === "" ||
      relative === ".." ||
      relative.startsWith(".." + path.sep) ||
      path.isAbsolute(relative)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
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
