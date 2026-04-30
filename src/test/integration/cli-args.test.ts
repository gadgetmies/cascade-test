import { test } from '../../index.js';
import { TestContext } from '../../types.js';
import { parseRunTestsCliArgs } from '../../lib/run-tests-cli-builder.js';
import { expect } from 'chai';

test({
  setup: async (): Promise<TestContext> => ({}),

  'CLI argument parsing': {
    'requires a path': (): void => {
      expect(() => parseRunTestsCliArgs([])).to.throw();
    },

    'parses path as first positional': (): void => {
      const argv = parseRunTestsCliArgs(['src/test/integration']);
      expect(argv.path).to.equal('src/test/integration');
    },

    'accepts --regex': (): void => {
      const argv = parseRunTestsCliArgs([
        'src/test',
        '--regex',
        'reporter-',
      ]);
      expect(argv.path).to.equal('src/test');
      expect(argv.regex).to.equal('reporter-');
    },

    'accepts -r as alias for --regex': (): void => {
      const argv = parseRunTestsCliArgs(['src/test', '-r', '\\.test\\.ts$']);
      expect(argv.regex).to.equal('\\.test\\.ts$');
    },

    'accepts --glob': (): void => {
      const argv = parseRunTestsCliArgs([
        'src/test',
        '--glob',
        '*.test.js',
      ]);
      expect(argv.path).to.equal('src/test');
      expect(argv.glob).to.equal('*.test.js');
    },

    'accepts -G as alias for --glob': (): void => {
      const argv = parseRunTestsCliArgs(['src/test', '-G', 'reporter-*']);
      expect(argv.glob).to.equal('reporter-*');
    },

    'accepts --test for case-level filtering': (): void => {
      const argv = parseRunTestsCliArgs([
        'src/test',
        '--test',
        'Basic Tests > should pass simple assertion',
      ]);
      expect(argv.test).to.equal('Basic Tests > should pass simple assertion');
    },

    'accepts -t as alias for --test': (): void => {
      const argv = parseRunTestsCliArgs(['src/test', '-t', 'should pass']);
      expect(argv.test).to.equal('should pass');
    },

    'rejects --regex and --glob together': (): void => {
      expect(() =>
        parseRunTestsCliArgs([
          'src/test',
          '--regex',
          'a',
          '--glob',
          'b',
        ])
      ).to.throw('Cannot use both --regex and --glob');
    },

    'applies defaults for reporter and ci': (): void => {
      const argv = parseRunTestsCliArgs(['src/test']);
      expect(argv.reporter).to.equal('console');
      expect(argv.ci).to.equal('auto');
    },

    'parses --reporter and --output': (): void => {
      const argv = parseRunTestsCliArgs([
        'src/test/examples',
        '--reporter=junit',
        '--output=out.xml',
      ]);
      expect(argv.reporter).to.equal('junit');
      expect(argv.output).to.equal('out.xml');
    },

    'accepts -o as alias for --output': (): void => {
      const argv = parseRunTestsCliArgs([
        'src/test',
        '-o',
        'results.json',
        '--reporter=json',
      ]);
      expect(argv.output).to.equal('results.json');
    },

    'parses --ci': (): void => {
      const argv = parseRunTestsCliArgs(['src/test', '--ci=github']);
      expect(argv.ci).to.equal('github');
    },

    'rejects unknown options in strict mode': (): void => {
      expect(() =>
        parseRunTestsCliArgs(['src/test', '--not-a-real-flag'])
      ).to.throw();
    },

    'rejects extra arguments after --': (): void => {
      expect(() =>
        parseRunTestsCliArgs(['src/test', '--', '--extra'])
      ).to.throw('Unknown argument(s): --extra');
    },

    'rejects invalid reporter': (): void => {
      expect(() =>
        parseRunTestsCliArgs(['src/test', '--reporter=verbose'])
      ).to.throw();
    },

    'rejects invalid ci value': (): void => {
      expect(() =>
        parseRunTestsCliArgs(['src/test', '--ci=circleci'])
      ).to.throw();
    },

    'parses coverage flags': (): void => {
      const argv = parseRunTestsCliArgs([
        'src/test',
        '--coverage',
        '--coverage-dir=tmp/cov',
        '--coverage-reporter',
        'text',
        '--coverage-reporter',
        'lcov',
        '--coverage-exclude',
        '**/vendor/**',
        '--coverage-include',
        'src/**',
        '--coverage-all',
        '--coverage-skip-full',
      ]);
      expect(argv.coverage).to.equal(true);
      expect(argv.coverageDir).to.equal('tmp/cov');
      expect(argv.coverageReporter).to.deep.equal(['text', 'lcov']);
      expect(argv.coverageExclude).to.deep.equal(['**/vendor/**']);
      expect(argv.coverageInclude).to.deep.equal(['src/**']);
      expect(argv.coverageAll).to.equal(true);
      expect(argv.coverageSkipFull).to.equal(true);
    },

    'defaults coverage-related options when coverage is off': (): void => {
      const argv = parseRunTestsCliArgs(['src/test']);
      expect(argv.coverage).to.equal(false);
      expect(argv.coverageDir).to.equal('coverage');
      expect(argv.coverageReporter).to.deep.equal(['text', 'html']);
      expect(argv.coverageAll).to.equal(false);
      expect(argv.coverageSkipFull).to.equal(false);
    },
  },
});
