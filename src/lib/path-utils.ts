import * as path from 'path';
import { fileURLToPath } from 'url';

export function getDisplayTestFile(testFile: string, basePath?: string): string {
  try {
    let actualPath = testFile;
    if (testFile.startsWith('file://')) {
      actualPath = fileURLToPath(testFile);
    }

    const relativeBase = basePath || process.cwd();
    return path.relative(relativeBase, actualPath);
  } catch {
    return testFile;
  }
}

export function isPathSafe(t: string, b: string = process.cwd()): boolean {
  const r = path.relative(path.resolve(b), path.resolve(b, t));
  return !r.startsWith('..' + path.sep) && r !== '..';
}
