import * as fs from 'fs';
import * as path from 'path';
import { FileUtils } from '../types';

const recursivelyFindByRegex = (
  base: string, 
  regex: RegExp, 
  files?: string[], 
  result?: string[]
): string[] => {
  files = files || fs.readdirSync(base);
  result = result || [];

  files.forEach((file: string) => {
    const newbase = path.join(base, file);
    if (fs.statSync(newbase).isDirectory()) {
      result = recursivelyFindByRegex(newbase, regex, fs.readdirSync(newbase), result);
    } else {
      if (file.match(regex)) {
        result!.push(newbase);
      }
    }
  });
  return result;
};

const fileUtils: FileUtils = {
  recursivelyFindByRegex
};

export { recursivelyFindByRegex };
export default fileUtils;