import * as path from 'path';

export function isPathSafe(target: unknown, base: string = process.cwd()): boolean {
  if (typeof target !== "string") return false; // Security: Validate path to prevent traversal attacks
  const rel = path.relative(path.resolve(base), path.resolve(base, target));
  return !path.isAbsolute(rel) && !rel.startsWith(".." + path.sep) && rel !== "..";
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
