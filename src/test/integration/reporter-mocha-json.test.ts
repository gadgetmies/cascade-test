import { test } from "../../index.js";
import {
  normalizationConfigs,
  setupReporterTest,
} from "../../lib/reporter-test-utils.js";
import * as path from "path";
import { fileURLToPath } from "url";
import { normalizeConfig } from "../../lib/fixture-utils.js";
import { assertFixture } from "../../lib/fixture-utils.js";
import { TestContext } from "../../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test({
  "Mocha JSON Reporter Tests": {
    setup: async () =>
      setupReporterTest({
        reporterName: "Mocha JSON",
        reporterType: "mocha-json",
        fixtureName: "expected-mocha-json.json",
      }),
    "should generate Mocha JSON output that matches fixture": (
      context?: TestContext
    ) => {
      assertFixture(
        context!.config.fixtureName,
        context!.result.reporterOutput,
        {
          fixturesDir: path.resolve(__dirname.replace('/dist/', '/src/'), "fixtures"),
          ...normalizeConfig(normalizationConfigs.mochaJson),
        }
      );
      return null;
    },
    "Mocha JSON output matches expected structure": {
      "should have stats object": (context?: TestContext): string | void => {
        if (!context!.result.reporterOutput.stats) {
          return "Mocha JSON output missing stats";
        }
      },

      "should have correct test count": (context?: TestContext): string | void => {
        if (context!.result.reporterOutput.stats?.tests !== 7) {
          return `Mocha JSON output incorrect test count: ${context!.result.reporterOutput.stats?.tests}`;
        }
      },

      "should have correct passes count": (context?: TestContext): string | void => {
        if (context!.result.reporterOutput.stats?.passes !== 4) {
          return `Mocha JSON output incorrect passes count: ${context!.result.reporterOutput.stats?.passes}`;
        }
      },

      "should have correct failures count": (context?: TestContext): string | void => {
        if (context!.result.reporterOutput.stats?.failures !== 1) {
          return `Mocha JSON output incorrect failures count: ${context!.result.reporterOutput.stats?.failures}`;
        }
      },

      "should have correct pending count": (context?: TestContext): string | void => {
        if (context!.result.reporterOutput.stats?.pending !== 2) {
          return `Mocha JSON output incorrect pending count: ${context!.result.reporterOutput.stats?.pending}`;
        }
      },

      "should have tests array": (context?: TestContext): string | void => {
        if (!Array.isArray(context!.result.reporterOutput.tests)) {
          return "Mocha JSON output missing tests array";
        }
      },

      "should have passes array": (context?: TestContext): string | void => {
        if (!Array.isArray(context!.result.reporterOutput.passes)) {
          return "Mocha JSON output missing passes array";
        }
      },

      "should have failures array": (context?: TestContext): string | void => {
        if (!Array.isArray(context!.result.reporterOutput.failures)) {
          return "Mocha JSON output missing failures array";
        }
      },

      "should have pending array": (context?: TestContext): string | void => {
        if (!Array.isArray(context!.result.reporterOutput.pending)) {
          return "Mocha JSON output missing pending array";
        }
      },

      "should have valid test items": (context?: TestContext): string | void => {
        for (const testItem of context!.result.reporterOutput.tests || []) {
          if (typeof testItem.title !== "string") {
            return "Test item missing title";
          }

          if (typeof testItem.fullTitle !== "string") {
            return "Test item missing fullTitle";
          }
        }
      },
    },
  },
});
