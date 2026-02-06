import { test } from '../../index.js';
import { TestContext } from '../../types.js';
import { strict as assert } from 'assert';
import * as chai from 'chai';
const { expect } = chai;

interface AsyncContext extends TestContext {
  counter: { value: number };
  asyncStore: {
    data: Map<string, any>;
    pendingOperations: Set<string>;
  };
  eventEmitter: {
    listeners: Map<string, Function[]>;
    emit: (event: string, data?: any) => void;
    on: (event: string, callback: Function) => void;
  };
}

const eventually = async <T>(
  checkFn: () => T | Promise<T>,
  options: {
    timeout?: number;
    interval?: number;
    errorMessage?: string;
  } = {}
): Promise<T> => {
  const { timeout = 5000, interval = 50, errorMessage = 'Condition not met within timeout' } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const result = await checkFn();
      if (result) {
        return result;
      }
    } catch (error) {
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error(errorMessage);
};

const waitFor = async (
  predicate: () => boolean | Promise<boolean>,
  options: {
    timeout?: number;
    interval?: number;
    timeoutMessage?: string;
  } = {}
): Promise<void> => {
  const { timeout = 5000, interval = 50, timeoutMessage = 'Timeout waiting for condition' } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await predicate();
    if (result) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error(timeoutMessage);
};

const eventuallyEqual = async <T>(
  getValue: () => T | Promise<T>,
  expected: T,
  options: {
    timeout?: number;
    interval?: number;
  } = {}
): Promise<void> => {
  await eventually(
    async () => {
      const actual = await getValue();
      if (actual === expected) {
        return true;
      }
      return false;
    },
    {
      ...options,
      errorMessage: `Value never became ${expected} within timeout`,
    }
  );
};

const retry = async <T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoff?: boolean;
  } = {}
): Promise<T> => {
  const { maxAttempts = 3, delayMs = 100, backoff = true } = options;
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        const delay = backoff ? delayMs * attempt : delayMs;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Operation failed after ${maxAttempts} attempts: ${lastError?.message}`);
};

test({
  setup: async (): Promise<AsyncContext> => {
    const counter = { value: 0 };
    const asyncStore = {
      data: new Map<string, any>(),
      pendingOperations: new Set<string>(),
    };

    const listeners = new Map<string, Function[]>();
    const eventEmitter = {
      listeners,
      emit: (event: string, data?: any) => {
        const eventListeners = listeners.get(event) || [];
        eventListeners.forEach(callback => callback(data));
      },
      on: (event: string, callback: Function) => {
        const eventListeners = listeners.get(event) || [];
        eventListeners.push(callback);
        listeners.set(event, eventListeners);
      },
    };

    return {
      counter,
      asyncStore,
      eventEmitter,
    };
  },

  'Eventually Pattern': {
    'should wait for value to eventually equal expected': async (context?: TestContext) => {
      const ctx = context as AsyncContext;

      setTimeout(() => {
        ctx.counter.value = 10;
      }, 200);

      await eventuallyEqual(() => ctx.counter.value, 10, { timeout: 1000, interval: 50 });
      expect(ctx.counter.value).to.equal(10);
    },

    'should wait for async operation to complete': async (context?: TestContext) => {
      const ctx = context as AsyncContext;

      const operationId = 'op-1';
      ctx.asyncStore.pendingOperations.add(operationId);

      setTimeout(() => {
        ctx.asyncStore.data.set(operationId, { status: 'complete', result: 42 });
        ctx.asyncStore.pendingOperations.delete(operationId);
      }, 150);

      await eventually(
        () => {
          const data = ctx.asyncStore.data.get(operationId);
          return data?.status === 'complete' ? data : null;
        },
        { timeout: 1000, interval: 25 }
      );

      const result = ctx.asyncStore.data.get(operationId);
      expect(result).to.deep.equal({ status: 'complete', result: 42 });
    },

    'should timeout if condition never met': async (context?: TestContext) => {
      const ctx = context as AsyncContext;

      try {
        await eventuallyEqual(() => ctx.counter.value, 999, { timeout: 200, interval: 50 });
        throw new Error('Should have thrown timeout error');
      } catch (error) {
        expect((error as Error).message).to.include('never became 999');
      }
    },

    'should handle multiple sequential checks': async (context?: TestContext) => {
      const ctx = context as AsyncContext;

      setTimeout(() => { ctx.counter.value = 1; }, 50);
      setTimeout(() => { ctx.counter.value = 2; }, 150);
      setTimeout(() => { ctx.counter.value = 3; }, 250);

      await eventuallyEqual(() => ctx.counter.value, 1, { timeout: 1000 });
      await eventuallyEqual(() => ctx.counter.value, 2, { timeout: 1000 });
      await eventuallyEqual(() => ctx.counter.value, 3, { timeout: 1000 });

      expect(ctx.counter.value).to.equal(3);
    },
  },

  'WaitFor Pattern': {
    'should wait for predicate to become true': async (context?: TestContext) => {
      const ctx = context as AsyncContext;

      setTimeout(() => {
        ctx.counter.value = 100;
      }, 100);

      await waitFor(
        () => ctx.counter.value >= 100,
        { timeout: 1000, timeoutMessage: 'Counter never reached 100' }
      );

      expect(ctx.counter.value).to.be.at.least(100);
    },

    'should wait for complex conditions': async (context?: TestContext) => {
      const ctx = context as AsyncContext;

      setTimeout(() => {
        ctx.asyncStore.data.set('user', { id: 1, name: 'Alice', verified: false });
      }, 50);

      setTimeout(() => {
        const user = ctx.asyncStore.data.get('user');
        if (user) {
          user.verified = true;
        }
      }, 150);

      await waitFor(
        () => {
          const user = ctx.asyncStore.data.get('user');
          return user?.verified === true;
        },
        { timeout: 1000 }
      );

      const user = ctx.asyncStore.data.get('user');
      expect(user.verified).to.be.true;
    },

    'should wait for collection to be populated': async (context?: TestContext) => {
      const ctx = context as AsyncContext;

      setTimeout(() => {
        ctx.asyncStore.data.set('item-1', 'first');
      }, 50);
      setTimeout(() => {
        ctx.asyncStore.data.set('item-2', 'second');
      }, 100);
      setTimeout(() => {
        ctx.asyncStore.data.set('item-3', 'third');
      }, 150);

      await waitFor(
        () => ctx.asyncStore.data.size >= 3,
        { timeout: 1000, timeoutMessage: 'Store never reached 3 items' }
      );

      expect(ctx.asyncStore.data.size).to.be.at.least(3);
    },
  },

  'Event-Based Waiting': {
    'should wait for event to be emitted': async (context?: TestContext) => {
      const ctx = context as AsyncContext;
      let eventData: any = null;

      const eventPromise = new Promise<void>((resolve) => {
        ctx.eventEmitter.on('dataLoaded', (data: any) => {
          eventData = data;
          resolve();
        });
      });

      setTimeout(() => {
        ctx.eventEmitter.emit('dataLoaded', { id: 123, value: 'loaded' });
      }, 100);

      await Promise.race([
        eventPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Event not emitted in time')), 1000)
        ),
      ]);

      expect(eventData).to.deep.equal({ id: 123, value: 'loaded' });
    },

    'should wait for multiple events in sequence': async (context?: TestContext) => {
      const ctx = context as AsyncContext;
      const events: string[] = [];

      ctx.eventEmitter.on('step1', () => events.push('step1'));
      ctx.eventEmitter.on('step2', () => events.push('step2'));
      ctx.eventEmitter.on('step3', () => events.push('step3'));

      setTimeout(() => ctx.eventEmitter.emit('step1'), 50);
      setTimeout(() => ctx.eventEmitter.emit('step2'), 100);
      setTimeout(() => ctx.eventEmitter.emit('step3'), 150);

      await waitFor(() => events.length === 3, { timeout: 1000 });

      expect(events).to.deep.equal(['step1', 'step2', 'step3']);
    },
  },

  'Retry Pattern': {
    'should retry operation until success': async () => {
      let attempts = 0;

      const result = await retry(
        async () => {
          attempts++;
          if (attempts < 3) {
            throw new Error('Not yet');
          }
          return 'success';
        },
        { maxAttempts: 5, delayMs: 50 }
      );

      expect(result).to.equal('success');
      expect(attempts).to.equal(3);
    },

    'should fail after max attempts': async () => {
      let attempts = 0;

      try {
        await retry(
          async () => {
            attempts++;
            throw new Error('Always fails');
          },
          { maxAttempts: 3, delayMs: 10, backoff: false }
        );
        throw new Error('Should have thrown');
      } catch (error) {
        expect((error as Error).message).to.include('failed after 3 attempts');
        expect(attempts).to.equal(3);
      }
    },

    'should use exponential backoff': async () => {
      const timestamps: number[] = [];
      let attempts = 0;

      try {
        await retry(
          async () => {
            attempts++;
            timestamps.push(Date.now());
            throw new Error('Fail');
          },
          { maxAttempts: 3, delayMs: 50, backoff: true }
        );
      } catch (error) {
      }

      expect(attempts).to.equal(3);
      expect(timestamps.length).to.equal(3);

      const delay1 = timestamps[1] - timestamps[0];
      const delay2 = timestamps[2] - timestamps[1];

      expect(delay2).to.be.greaterThan(delay1);
    },

    'should retry flaky async operations': async (context?: TestContext) => {
      const ctx = context as AsyncContext;
      let callCount = 0;

      const flakyOperation = async () => {
        callCount++;
        
        await new Promise(resolve => setTimeout(resolve, 20));
        
        if (callCount <= 2) {
          throw new Error('Temporary failure');
        }
        
        ctx.asyncStore.data.set('result', { success: true, attempts: callCount });
        return ctx.asyncStore.data.get('result');
      };

      const result = await retry(flakyOperation, { maxAttempts: 5, delayMs: 30 });

      expect(result).to.deep.equal({ success: true, attempts: 3 });
      expect(callCount).to.equal(3);
    },
  },

  'Combined Patterns': {
    'should combine retry with eventually': async (context?: TestContext) => {
      const ctx = context as AsyncContext;

      const startAsyncOperation = async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        ctx.asyncStore.data.set('status', 'processing');
        
        setTimeout(() => {
          ctx.asyncStore.data.set('status', 'complete');
        }, 100);
        
        return true;
      };

      await retry(startAsyncOperation, { maxAttempts: 3, delayMs: 20 });

      await eventuallyEqual(
        () => ctx.asyncStore.data.get('status'),
        'complete',
        { timeout: 1000 }
      );

      expect(ctx.asyncStore.data.get('status')).to.equal('complete');
    },

    'should handle race conditions': async (context?: TestContext) => {
      const ctx = context as AsyncContext;

      const writer1 = async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        if (!ctx.asyncStore.data.has('shared')) {
          ctx.asyncStore.data.set('shared', 'writer1');
        }
      };

      const writer2 = async () => {
        await new Promise(resolve => setTimeout(resolve, 60));
        if (!ctx.asyncStore.data.has('shared')) {
          ctx.asyncStore.data.set('shared', 'writer2');
        }
      };

      await Promise.all([writer1(), writer2()]);

      await eventually(
        () => ctx.asyncStore.data.get('shared'),
        { timeout: 1000 }
      );

      const value = ctx.asyncStore.data.get('shared');
      expect(['writer1', 'writer2']).to.include(value);
    },

    'should wait for parallel operations': async (context?: TestContext) => {
      const ctx = context as AsyncContext;

      const operation1 = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        ctx.asyncStore.data.set('op1', 'done');
      };

      const operation2 = async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
        ctx.asyncStore.data.set('op2', 'done');
      };

      const operation3 = async () => {
        await new Promise(resolve => setTimeout(resolve, 80));
        ctx.asyncStore.data.set('op3', 'done');
      };

      Promise.all([operation1(), operation2(), operation3()]);

      await waitFor(
        () => ctx.asyncStore.data.has('op1') && 
              ctx.asyncStore.data.has('op2') && 
              ctx.asyncStore.data.has('op3'),
        { timeout: 1000 }
      );

      expect(ctx.asyncStore.data.get('op1')).to.equal('done');
      expect(ctx.asyncStore.data.get('op2')).to.equal('done');
      expect(ctx.asyncStore.data.get('op3')).to.equal('done');
    },
  },

  'Real-World Scenarios': {
    'should simulate API polling': async (context?: TestContext) => {
      const ctx = context as AsyncContext;

      const jobId = 'job-123';
      ctx.asyncStore.data.set(jobId, { status: 'pending', progress: 0 });

      setTimeout(() => ctx.asyncStore.data.set(jobId, { status: 'running', progress: 30 }), 50);
      setTimeout(() => ctx.asyncStore.data.set(jobId, { status: 'running', progress: 60 }), 150);
      setTimeout(() => ctx.asyncStore.data.set(jobId, { status: 'running', progress: 90 }), 250);
      setTimeout(() => ctx.asyncStore.data.set(jobId, { status: 'completed', progress: 100 }), 350);

      await eventually(
        () => {
          const job = ctx.asyncStore.data.get(jobId);
          return job?.status === 'completed' ? job : null;
        },
        { timeout: 1000, interval: 30 }
      );

      const finalJob = ctx.asyncStore.data.get(jobId);
      expect(finalJob.status).to.equal('completed');
      expect(finalJob.progress).to.equal(100);
    },

    'should simulate database transaction': async (context?: TestContext) => {
      const ctx = context as AsyncContext;

      const transactionId = 'txn-456';
      
      const beginTransaction = async () => {
        ctx.asyncStore.pendingOperations.add(transactionId);
        ctx.asyncStore.data.set(transactionId, { state: 'started', records: [] });
      };

      const addRecord = async (record: any) => {
        await new Promise(resolve => setTimeout(resolve, 50));
        const txn = ctx.asyncStore.data.get(transactionId);
        txn.records.push(record);
      };

      const commitTransaction = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        const txn = ctx.asyncStore.data.get(transactionId);
        txn.state = 'committed';
        ctx.asyncStore.pendingOperations.delete(transactionId);
      };

      await beginTransaction();
      
      Promise.all([
        addRecord({ id: 1, value: 'a' }),
        addRecord({ id: 2, value: 'b' }),
        addRecord({ id: 3, value: 'c' }),
      ]).then(() => commitTransaction());

      await waitFor(
        () => {
          const txn = ctx.asyncStore.data.get(transactionId);
          return txn?.state === 'committed' && txn.records.length === 3;
        },
        { timeout: 1000 }
      );

      const txn = ctx.asyncStore.data.get(transactionId);
      expect(txn.state).to.equal('committed');
      expect(txn.records).to.have.lengthOf(3);
      expect(ctx.asyncStore.pendingOperations.has(transactionId)).to.be.false;
    },

    'should simulate cache warm-up': async (context?: TestContext) => {
      const ctx = context as AsyncContext;

      const requiredKeys = ['config', 'users', 'products', 'settings'];

      const warmUpCache = async () => {
        for (const key of requiredKeys) {
          await new Promise(resolve => setTimeout(resolve, 50));
          ctx.asyncStore.data.set(key, { loaded: true, timestamp: Date.now() });
        }
      };

      warmUpCache();

      await waitFor(
        () => requiredKeys.every(key => ctx.asyncStore.data.has(key)),
        { timeout: 1000, timeoutMessage: 'Cache warm-up timed out' }
      );

      requiredKeys.forEach(key => {
        expect(ctx.asyncStore.data.get(key)).to.have.property('loaded', true);
      });
    },
  },
});




















