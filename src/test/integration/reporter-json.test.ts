import { test } from "../../index.js";
import {
  normalizationConfigs,
  setupReporterTest,
} from "../../lib/reporter-test-utils.js";
import * as path from "path";
import { fileURLToPath } from "url";
import { assertFixture, normalizeConfig } from "../../lib/fixture-utils.js";
import { TestContext } from "../../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test({
  "JSON Reporter Tests": {
    setup: async () =>
      setupReporterTest({
        reporterName: "JSON",
        reporterType: "json",
        fixtureName: "expected-json.json",
      }),
    "generates JSON output that matches fixture": (context?: TestContext) => {
      assertFixture(
        context!.config.fixtureName,
        context!.result.reporterOutput,
        {
          fixturesDir: path.resolve(__dirname.replace('/dist/', '/src/'), "fixtures"),
          ...normalizeConfig(normalizationConfigs.json),
        }
      );
    },

    "JSON output matches expected structure": {
        "should have summary object": (context?: TestContext): string | void => {
          if (!context!.result.reporterOutput.summary) {
            return "JSON output missing summary";
          }
        },
  
        "should have numeric summary.total": (context?: TestContext): string | void => {
          if (typeof context!.result.reporterOutput.summary?.total !== "number") {
            return "JSON output summary.total is not a number";
          }
        },
  
        "should have numeric summary.passed": (context?: TestContext): string | void => {
          if (typeof context!.result.reporterOutput.summary?.passed !== "number") {
            return "JSON output summary.passed is not a number";
          }
        },
  
        "should have numeric summary.failed": (context?: TestContext): string | void => {
          if (typeof context!.result.reporterOutput.summary?.failed !== "number") {
            return "JSON output summary.failed is not a number";
          }
        },
  
        "should have results array": (context?: TestContext): string | void => {
          if (!Array.isArray(context!.result.reporterOutput.results)) {
            return "JSON output missing results array";
          }
        },
      },
  },
});
