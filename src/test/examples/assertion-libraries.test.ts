import { test } from '../../index.js';
import { TestContext } from '../../types.js';
import { strict as assert } from 'assert';
import * as chai from 'chai';
const { expect } = chai;

chai.should();

interface CalculatorContext extends TestContext {
  calculator: {
    add: (a: number, b: number) => number;
    multiply: (a: number, b: number) => number;
    divide: (a: number, b: number) => number;
  };
  user: {
    name: string;
    age: number;
    email: string;
    preferences: {
      theme: string;
      notifications: boolean;
    };
  };
  items: string[];
}

test({
  setup: async (): Promise<CalculatorContext> => {
    return {
      calculator: {
        add: (a, b) => a + b,
        multiply: (a, b) => a * b,
        divide: (a, b) => a / b,
      },
      user: {
        name: 'Alice',
        age: 30,
        email: 'alice@example.com',
        preferences: {
          theme: 'dark',
          notifications: true,
        },
      },
      items: ['apple', 'banana', 'cherry'],
    };
  },

  'Node.js Built-in Assert (strict mode)': {
    'should perform basic equality checks': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      const result = ctx.calculator.add(2, 3);
      assert.equal(result, 5);
      assert.strictEqual(result, 5);
    },

    'should check object properties': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      const user = ctx.user;
      assert.equal(user.name, 'Alice');
      assert.equal(user.age, 30);
      assert.ok(user.preferences.notifications);
    },

    'should perform deep equality checks': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      const expected = {
        theme: 'dark',
        notifications: true,
      };
      assert.deepStrictEqual(ctx.user.preferences, expected);
    },

    'should check array contents': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      assert.ok(ctx.items.includes('banana'));
      assert.equal(ctx.items.length, 3);
      assert.deepStrictEqual(ctx.items, ['apple', 'banana', 'cherry']);
    },

    'should check types': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      assert.equal(typeof ctx.calculator.add, 'function');
      assert.equal(typeof ctx.user.age, 'number');
      assert.equal(typeof ctx.user.name, 'string');
    },

    'should check for thrown errors': () => {
      assert.throws(() => {
        throw new Error('Expected error');
      }, Error);
    },
  },

  'Chai Expect Style': {
    'should perform basic assertions': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      const result = ctx.calculator.multiply(4, 5);
      expect(result).to.equal(20);
      expect(result).to.be.a('number');
    },

    'should chain assertions': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      expect(ctx.user.name)
        .to.be.a('string')
        .and.equal('Alice')
        .and.have.length.greaterThan(3);
    },

    'should check object properties': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      expect(ctx.user).to.have.property('name', 'Alice');
      expect(ctx.user).to.have.property('age').that.is.a('number');
      expect(ctx.user.email).to.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
    },

    'should perform deep equality': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      expect(ctx.user.preferences).to.deep.equal({
        theme: 'dark',
        notifications: true,
      });
    },

    'should check array contents': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      expect(ctx.items).to.be.an('array');
      expect(ctx.items).to.have.lengthOf(3);
      expect(ctx.items).to.include('apple');
      expect(ctx.items).to.have.members(['apple', 'banana', 'cherry']);
    },

    'should check existence and truthiness': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      expect(ctx.user.name).to.exist;
      expect(ctx.user.preferences.notifications).to.be.true;
      expect(ctx.user.age).to.be.above(18);
      expect(ctx.user.age).to.be.below(100);
    },

    'should check for thrown errors': () => {
      expect(() => {
        throw new Error('Test error');
      }).to.throw('Test error');
    },

    'should work with async functions': async (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      const asyncAdd = async (a: number, b: number) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return ctx.calculator.add(a, b);
      };

      const result = await asyncAdd(10, 20);
      expect(result).to.equal(30);
    },
  },

  'Chai Should Style': {
    'should perform basic assertions': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      const result = ctx.calculator.divide(20, 4);
      (result as any).should.equal(5);
      (result as any).should.be.a('number');
    },

    'should chain assertions fluently': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      (ctx.user.name as any).should.be.a('string').and.have.length.above(0);
      (ctx.user.age as any).should.be.a('number').and.be.at.least(18);
    },

    'should check object properties': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      (ctx.user as any).should.have.property('email');
      (ctx.user.preferences as any).should.deep.equal({
        theme: 'dark',
        notifications: true,
      });
    },

    'should check array contents': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      (ctx.items as any).should.be.an('array');
      (ctx.items as any).should.have.lengthOf(3);
      (ctx.items as any).should.include('cherry');
    },

    'should work with negations': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      (ctx.user.age as any).should.not.equal(25);
      (ctx.items as any).should.not.be.empty;
      (ctx.user.name as any).should.not.match(/\d+/);
    },
  },

  'Chai Assert Style': {
    'should perform basic assertions': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      const result = ctx.calculator.add(7, 8);
      chai.assert.equal(result, 15);
      chai.assert.typeOf(result, 'number');
    },

    'should check object properties': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      chai.assert.property(ctx.user, 'name');
      chai.assert.propertyVal(ctx.user, 'age', 30);
      chai.assert.nestedProperty(ctx.user, 'preferences.theme');
      chai.assert.nestedPropertyVal(ctx.user, 'preferences.theme', 'dark');
    },

    'should perform deep equality': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      chai.assert.deepEqual(ctx.user.preferences, {
        theme: 'dark',
        notifications: true,
      });
    },

    'should check arrays': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      chai.assert.isArray(ctx.items);
      chai.assert.lengthOf(ctx.items, 3);
      chai.assert.include(ctx.items, 'banana');
      chai.assert.sameMembers(ctx.items, ['cherry', 'banana', 'apple']);
    },

    'should check types': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      chai.assert.isString(ctx.user.name);
      chai.assert.isNumber(ctx.user.age);
      chai.assert.isObject(ctx.user.preferences);
      chai.assert.isFunction(ctx.calculator.add);
      chai.assert.isTrue(ctx.user.preferences.notifications);
    },

    'should check ranges': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      chai.assert.isAbove(ctx.user.age, 18);
      chai.assert.isBelow(ctx.user.age, 100);
      chai.assert.isAtLeast(ctx.user.age, 30);
      chai.assert.isAtMost(ctx.user.age, 30);
    },
  },

  'Demonstrating Test Failures': {
    'assert failure shows descriptive error': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      const result = ctx.calculator.add(2, 2);
      assert.equal(result, 5, 'Expected 2 + 2 to equal 5');
    },

    'expect failure shows diff': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      expect(ctx.user.age).to.equal(25);
    },

    'should style failure': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      (ctx.items as any).should.include('orange');
    },

    'deep equality failure shows differences': (context?: TestContext) => {
      const ctx = context as CalculatorContext;
      expect(ctx.user).to.deep.equal({
        name: 'Bob',
        age: 25,
        email: 'bob@example.com',
        preferences: {
          theme: 'light',
          notifications: false,
        },
      });
    },
  },
});
