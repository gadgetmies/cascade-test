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
  "TAP Reporter Tests": {
    setup: async () =>
      setupReporterTest({
        reporterName: "TAP",
        reporterType: "tap",
        fixtureName: "expected-tap.tap",
      }),
    "should generate TAP output that matches fixture": (
      context?: TestContext
    ) => {
      assertFixture(
        context!.config.fixtureName,
        context!.result.reporterOutput,
        {
          fixturesDir: path.resolve(__dirname.replace('/dist/', '/src/'), "fixtures"),
          ...normalizeConfig(normalizationConfigs.tap),
        }
      );
    },
    "TAP output matches expected structure": {
      "should have TAP version header": (context?: TestContext): string | void=> {
        if (!context!.result.reporterOutput.includes("TAP version 13")) {
          return "TAP output missing version header";
        }
      },

      "should have correct test plan": (context?: TestContext): string | void => {
        if (!context!.result.reporterOutput.includes("1..7")) {
          return "TAP output incorrect test plan";
        }
      },

      "should have ok directives": (context?: TestContext): string | void => {
        if (!context!.result.reporterOutput.match(/ok \d+/)) {
          return "TAP output missing ok directives";
        }
      },

      "should have not ok directives": (context?: TestContext): string | void => {
        if (!context!.result.reporterOutput.match(/not ok \d+/)) {
          return "TAP output missing not ok directives";
        }
      },

      "should have test descriptions": (context?: TestContext): string | void => {
        if (!context!.result.reporterOutput.includes("should pass simple assertion")) {
          return "TAP output missing test descriptions";
        }
      },
    },
  },
});
