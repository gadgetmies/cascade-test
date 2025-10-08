import { test } from "../../index.js";
import { TestContext } from "../../types.js";

test({
  "Nested Suites": {
    setup: async (): Promise<TestContext> => {
      return {
        originalData: "original",
      };
    },
    "with modified context": {
      setup: async (parentContext?: TestContext): Promise<TestContext> => {
        return {
          ...parentContext,
          nestedData: "nested",
        };
      },
      "should access nested context": (context?: TestContext): string | void => {
        if (context?.originalData !== "original") {
          return "Original context not available";
        }
        if (context?.nestedData !== "nested") {
          return "Nested context not available";
        }
      },
    },
    "with original context": {
      "should have access to original context": (context?: TestContext): string | void => {
        if (context?.originalData !== "original") {
          return "Nested context not available";
        }
      },
    },
  },
});
