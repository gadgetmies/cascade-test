import { test } from "../../index.js";
import { TestContext, TestRunResult } from "../../types.js";
import {
  assertFixture,
  createFixture,
  readFixture,
  normalizeConfig,
} from "../../lib/fixture-utils.js";
import { fileURLToPath } from "url";
import path from "path";
import { normalizationConfigs } from "../../lib/reporter-test-utils.js";
import { unlink } from "fs/promises";
import { diff } from "jest-diff";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test({
  "Fixture Utility Tests": {
    "should assert fixture matches test data": () => {
      const testData = {
        name: "Test User",
        email: "test@example.com",
        age: 30,
        preferences: {
          theme: "dark",
          notifications: true,
        },
      };

      assertFixture("user-data.json", testData, {
        ...normalizeConfig(normalizationConfigs.json),
      });

      return null;
    },

    "should demonstrate environment variable behavior": {
      skip: () => ({
        reason:
          "Need to figure out how to test the environment variable behavior",
        until: "2025-11-01",
      }),
    },

    "should normalize data before comparison": () => {
      const testData = {
        timestamp: new Date().toISOString(),
        id: "unique-id-123",
        duration: 1500,
        user: {
          name: "John Doe",
          createdAt: new Date().toISOString(),
        },
      };

      assertFixture("normalized-data.json", testData, {
        ...normalizeConfig({
          timestamp: "[TIMESTAMP]",
          id: "[ID]",
          duration: "[DURATION]",
          "user.createdAt": "[TIMESTAMP]",
        }),
      });
    },

    "should handle complex nested data structures": () => {
      const testData = {
        users: [
          { id: 1, name: "Alice", score: 95 },
          { id: 2, name: "Bob", score: 87 },
          { id: 3, name: "Charlie", score: 92 },
        ],
        metadata: {
          total: 3,
          average: 91.33,
          generated: new Date().toISOString(),
        },
      };

      assertFixture("complex-data.json", testData, {
        ...normalizeConfig({
          "metadata.generated": "[TIMESTAMP]",
        }),
      });
    },

    "should read existing fixture data": () => {
      const fixtureData = readFixture("user-data.json");

      if (!fixtureData) {
        return "Failed to read fixture data";
      }

      if (fixtureData!.name !== "Test User") {
        return `Expected name 'Test User', got '${fixtureData.name}'`;
      }

      if (fixtureData!.email !== "test@example.com") {
        return `Expected email 'test@example.com', got '${fixtureData.email}'`;
      }

      return null;
    },

    "should create fixture programmatically": {
      setup: () => {
        const data = {
          config: {
            version: "1.0.0",
            features: ["auth", "api", "ui"],
          },
          settings: {
            debug: false,
            logLevel: "info",
          },
        };
        return {
          fixtureData: data,
          fixturePath: createFixture("config-data.json", data),
        };
      },
      teardown: (context?: TestContext) => {
        try {
          unlink(context!.fixturePath);
        } catch (e) {}
      },
      "should return correct fixture path": (context?: TestContext) => {
        // The fixture path should be in the source directory, not the dist directory
        // because the fixture utility maps compiled paths back to source paths
        const expectedRelativePath = "fixtures/config-data.json";
        const expectedAbsolutePath = path.resolve(__dirname.replace('/dist/', '/src/'), expectedRelativePath);
        
        if (context!.fixturePath !== expectedAbsolutePath) {
          const diffResult = diff(expectedAbsolutePath, context!.fixturePath);
          return `Unexpected fixture path.\n\nDiff:\n${diffResult || "Values are different but no diff available"}`;
        }

        assertFixture("config-data.json", context!.fixtureData);

        return null;
      },
    },
  },
});
