import { test } from "../../index.js";
import { TestContext } from "../../types.js";
import * as sinon from "sinon";
import { strict as assert } from "assert";

interface MockingContext extends TestContext {
  apiClient: {
    fetchUser: (id: string) => Promise<{ id: string; name: string }>;
    updateUser: (id: string, data: any) => Promise<void>;
  };
  logger: {
    info: (message: string) => void;
    error: (message: string) => void;
  };
  clock: sinon.SinonFakeTimers;
}

interface MockingContextWithSpy extends MockingContext {
  spy: sinon.SinonSpy;
}

interface MockingContextWithStub extends MockingContext {
  stub: sinon.SinonStub;
}

interface RealWorldContext extends MockingContext {
  fetchUser: sinon.SinonStub;
  updateUser: sinon.SinonStub;
  loggerSpy: sinon.SinonSpy;
}

const restoreStub = (context?: TestContext) => {
  context!.stub.restore();
};

const restoreSpy = (context?: TestContext) => {
  context!.spy.restore();
};

test({
  setup: async (): Promise<MockingContext> => {
    const apiClient = {
      fetchUser: async (id: string) => ({ id, name: "Real User" }),
      updateUser: async () => {},
    };

    const logger = {
      info: (message: string) => console.log(`[INFO] ${message}`),
      error: (message: string) => console.error(`[ERROR] ${message}`),
    };

    const clock = sinon.useFakeTimers({
      now: new Date("2025-01-01T00:00:00Z"),
      shouldAdvanceTime: false,
    });

    return { apiClient, logger, clock };
  },

  teardown: async (context?: TestContext) => {
    const ctx = context as MockingContext;
    sinon.restore();
    if (ctx.clock) {
      ctx.clock.restore();
    }
  },

  "Spies - Track Function Calls": {
    "sync function": {
      setup: (context?: TestContext) => ({
        spy: sinon.spy(context!.logger, "info"),
        ...context,
      }),
      "can track how many times a function was called": (
        context?: TestContext
      ) => {
        const ctx = context as MockingContextWithSpy;

        ctx.logger.info("First message");
        ctx.logger.info("Second message");

        assert.equal(ctx.spy.callCount, 2);
        assert.ok(ctx.spy.calledWith("First message"));
      },
      teardown: restoreSpy,
    },

    "async function": {
      setup: (context?: TestContext) => ({
        spy: sinon.spy(context!.apiClient, "fetchUser"),
        ...context,
      }),
      "also works": async (context?: TestContext) => {
        const ctx = context as MockingContextWithSpy;

        await ctx.apiClient.fetchUser("user-123");

        assert.equal(ctx.spy.callCount, 1);
        assert.ok(ctx.spy.calledWith("user-123"));
      },
      teardown: restoreSpy,
    },
  },

  "Stubs - Replace Function Behavior": {
    "stubbed function": {
      setup: (context?: TestContext) => ({
        stub: sinon.stub(context!.apiClient, "fetchUser"),
        ...context,
      }),
      "can return custom values": async (context?: TestContext) => {
        const ctx = context as MockingContextWithStub;
        ctx.stub.resolves({ id: "mock-id", name: "Mocked User" });

        const result = await ctx.apiClient.fetchUser("any-id");

        assert.equal(result.name, "Mocked User");
        assert.ok(ctx.stub.calledOnce);
      },
      teardown: restoreStub,
    },

    "another stubbed function": {
      setup: (context?: TestContext) => ({
        stub: sinon.stub(context!.apiClient, "updateUser"),
        ...context,
      }),
      "can simulate errors": async (context?: TestContext) => {
        const ctx = context as MockingContextWithStub;
        ctx.stub.rejects(new Error("Network error"));

        let errorCaught = false;
        try {
          await ctx.apiClient.updateUser("user-1", { name: "New Name" });
        } catch (error: any) {
          errorCaught = true;
          assert.equal(error.message, "Network error");
        }

        assert.ok(errorCaught);
      },
      teardown: restoreStub,
    },
  },

  "Fake Timers - Control Time": {
    "can control setTimeout": (context?: TestContext) => {
      const ctx = context as MockingContext;
      const callback = sinon.spy();

      setTimeout(callback, 1000);
      assert.equal(callback.callCount, 0);

      ctx.clock.tick(1000);
      assert.equal(callback.callCount, 1);
    },

    "can test async operations with delays": async (context?: TestContext) => {
      const ctx = context as MockingContext;
      const callback = sinon.spy();

      const delayedOperation = () => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            callback();
            resolve();
          }, 2000);
        });
      };

      const promise = delayedOperation();
      await ctx.clock.tickAsync(2000);
      await promise;

      assert.equal(callback.callCount, 1);
    },
  },

  "Real-World Example": {
    "with mocked dependencies": {
      setup: (context?: TestContext) => ({
        fetchStub: sinon.stub(context!.apiClient, "fetchUser"),
        updateStub: sinon.stub(context!.apiClient, "updateUser"),
        loggerSpy: sinon.spy(context!.logger, "info"),
        ...context,
      }),
      "user registration works": async (context?: TestContext) => {
        const ctx = context as RealWorldContext;

        ctx.fetchStub.resolves({ id: "existing-id", name: "Existing User" });
        ctx.updateStub.resolves();

        const updateUserName = async (userId: string, newName: string) => {
          const user = await ctx.apiClient.fetchUser(userId);
          ctx.logger.info(`Updating user ${user.name}`);

          await ctx.apiClient.updateUser(userId, { name: newName });

          ctx.logger.info("Update complete");
          return { ...user, name: newName };
        };

        const result = await updateUserName("user-123", "Updated Name");

        assert.equal(result.name, "Updated Name");
        assert.ok(ctx.fetchStub.calledOnce);
        assert.ok(ctx.updateStub.calledOnce);
        assert.equal(ctx.loggerSpy.callCount, 2);
      },
      teardown: (context?: TestContext) => {
        const ctx = context as RealWorldContext;
        ctx.fetchStub.restore();
        ctx.updateStub.restore();
        ctx.loggerSpy.restore();
      },
    },
  },
});
