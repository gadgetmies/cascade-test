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
      return null;
    },
    "TAP output matches expected structure": {
      "should have TAP version header": (context?: TestContext) => {
        if (!context!.result.reporterOutput.includes("TAP version 13")) {
          return "TAP output missing version header";
        }
        return null;
      },

      "should have correct test plan": (context?: TestContext) => {
        if (!context!.result.reporterOutput.includes("1..7")) {
          return "TAP output incorrect test plan";
        }
        return null;
      },

      "should have ok directives": (context?: TestContext) => {
        if (!context!.result.reporterOutput.match(/ok \d+/)) {
          return "TAP output missing ok directives";
        }
        return null;
      },

      "should have not ok directives": (context?: TestContext) => {
        if (!context!.result.reporterOutput.match(/not ok \d+/)) {
          return "TAP output missing not ok directives";
        }
        return null;
      },

      "should have test descriptions": (context?: TestContext) => {
        if (!context!.result.reporterOutput.includes("should pass simple assertion")) {
          return "TAP output missing test descriptions";
        }
        return null;
      },
    },
  },
});
