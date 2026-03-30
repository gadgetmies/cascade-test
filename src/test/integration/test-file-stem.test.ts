import { test } from '../../index.js';
import { TestContext } from '../../types.js';
import { expect } from 'chai';
import {
  testFileBasenameStem,
  filterTestPathsByStemRegex,
  normalizeGlobPatternForStemMatch,
  filterTestPathsByStemGlob,
} from '../../lib/file-utils.js';

test({
  setup: async (): Promise<TestContext> => ({}),

  'test file stem and name filter': {
    'strips .js then matches logical TypeScript-style names': (): void => {
      expect(testFileBasenameStem('basic.test.js')).to.equal('basic.test');
      expect(testFileBasenameStem('basic.test.ts')).to.equal('basic.test');
    },

    'strips .d.ts before .ts so declarations are not misread': (): void => {
      expect(testFileBasenameStem('foo.d.ts')).to.equal('foo');
    },

    'filter keeps paths whose stem matches the regex': (): void => {
      const paths = [
        '/x/framework.test.js',
        '/x/cli-args.test.js',
        '/y/other.js',
      ];
      const filtered = filterTestPathsByStemRegex(paths, /^framework\.test$/);
      expect(filtered).to.deep.equal(['/x/framework.test.js']);
    },

    'normalizeGlobPatternForStemMatch strips a trailing .js/.ts/.d.ts': (): void => {
      expect(normalizeGlobPatternForStemMatch('*.test.js')).to.equal('*.test');
      expect(normalizeGlobPatternForStemMatch('*.test.ts')).to.equal('*.test');
      expect(normalizeGlobPatternForStemMatch('foo.d.ts')).to.equal('foo');
    },

    'filterTestPathsByStemGlob matches stem with shell-style globs': (): void => {
      const paths = ['/x/framework.test.js', '/x/cli-args.test.js'];
      expect(filterTestPathsByStemGlob(paths, 'framework.test.js')).to.deep.equal([
        '/x/framework.test.js',
      ]);
      expect(filterTestPathsByStemGlob(paths, 'framework.test')).to.deep.equal([
        '/x/framework.test.js',
      ]);
      expect(filterTestPathsByStemGlob(paths, '*.test')).to.deep.equal(paths);
    },
  },
});
