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
  "JUnit Reporter Tests": {
    setup: async () =>
      setupReporterTest({
        reporterName: "JUnit",
        reporterType: "junit",
        fixtureName: "expected-junit.xml",
      }),
    "should generate JUnit XML output that matches fixture": (
      context?: TestContext
    ) => {
      assertFixture(
        context!.config.fixtureName,
        context!.result.reporterOutput,
        {
          fixturesDir: path.resolve(__dirname.replace('/dist/', '/src/'), "fixtures"),
          ...normalizeConfig(normalizationConfigs.junit),
        }
      );
      return null;
    },
    "JUnit XML output matches expected structure": {
        "should have XML declaration": (context?: TestContext): string | void => {
          if (!context!.result.reporterOutput.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
            return "JUnit output is not valid XML";
          }
        },
  
        "should have testsuite element": (context?: TestContext): string | void => {
          if (!context!.result.reporterOutput.includes("<testsuite")) {
            return "JUnit output missing testsuite element";
          }
        },
  
        "should have correct test count": (context?: TestContext): string | void => {
          if (!context!.result.reporterOutput.includes('tests="7"')) {
            return "JUnit output incorrect test count";
          }
        },
  
        "should have correct failure count": (context?: TestContext): string | void => {
          if (!context!.result.reporterOutput.includes('failures="1"')) {
            return "JUnit output incorrect failure count";
          }
        },
      },
  },
});
