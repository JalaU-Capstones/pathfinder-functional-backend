const { of, chain, map, tryCatch, pipeAsync } = require('../../src/utils/monad');

describe('Monad Utilities', () => {
  describe('of (unit)', () => {
    it('wraps a plain value in a Promise', async () => {
      await expect(of(42)).resolves.toBe(42);
      await expect(of('hello')).resolves.toBe('hello');
      await expect(of(null)).resolves.toBe(null);
      await expect(of({ x: 1 })).resolves.toEqual({ x: 1 });
    });
  });

  describe('chain (bind / flatMap)', () => {
    it('applies an async function and flattens the result', async () => {
      const result = await chain(x => Promise.resolve(x * 2))(Promise.resolve(5));
      expect(result).toBe(10);
    });

    it('propagates rejection from inner function', async () => {
      const error = new Error('fail');
      await expect(chain(() => Promise.reject(error))(Promise.resolve(5))).rejects.toThrow('fail');
    });

    it('propagates rejection from initial promise', async () => {
      const error = new Error('fail');
      await expect(chain(x => Promise.resolve(x))(Promise.reject(error))).rejects.toThrow('fail');
    });
  });

  describe('map', () => {
    it('applies a pure function inside the Promise context', async () => {
      const result = await map(x => x + 1)(Promise.resolve(5));
      expect(result).toBe(6);
    });

    it('applies a pure function inside the Promise context', async () => {
      const result = await map(x => x + 1)(Promise.resolve(5));
      expect(result).toBe(6);
    });
  });

  describe('tryCatch', () => {
    it('lifts a successful async function into a resolved promise', async () => {
      await expect(tryCatch(() => Promise.resolve('ok'))).resolves.toBe('ok');
    });

    it('lifts a synchronously throwing function into a rejected promise', async () => {
      const error = new Error('sync fail');
      await expect(tryCatch(() => { throw error; })).rejects.toThrow('sync fail');
    });

    it('lifts an async function that returns a rejected promise into a rejected promise', async () => {
      const error = new Error('async fail');
      await expect(tryCatch(() => Promise.reject(error))).rejects.toThrow('async fail');
    });
  });

  describe('pipeAsync', () => {
    it('applies functions left-to-right', async () => {
      const f = x => Promise.resolve(x + 1);
      const g = x => Promise.resolve(x * 2);
      const result = await pipeAsync(f, g)(5);
      expect(result).toBe(12);
    });

    it('rejects the pipeline if any step rejects', async () => {
      const f = x => Promise.resolve(x + 1);
      const g = () => Promise.reject(new Error('pipeline fail'));
      const h = () => Promise.resolve(0);
      
      await expect(pipeAsync(f, g, h)(5)).rejects.toThrow('pipeline fail');
    });

    it('resolves to the initial value if no functions are provided', async () => {
      await expect(pipeAsync()(42)).resolves.toBe(42);
    });
  });

  describe('Monad Laws', () => {
    it('satisfies left identity: of(a).chain(f) ≡ f(a)', async () => {
      const a = 5;
      const f = (x) => Promise.resolve(x * 2);
      
      const monadResult = await chain(f)(of(a));
      const fnResult = await f(a);
      
      expect(monadResult).toEqual(fnResult);
    });

    it('satisfies right identity: m.chain(of) ≡ m', async () => {
      const m = Promise.resolve(5);
      
      const monadResult = await chain(of)(m);
      const mResult = await m;
      
      expect(monadResult).toEqual(mResult);
    });

    it('satisfies associativity: m.chain(f).chain(g) ≡ m.chain(x => f(x).chain(g))', async () => {
      const m = Promise.resolve(5);
      const f = (x) => Promise.resolve(x + 2);
      const g = (x) => Promise.resolve(x * 3);
      
      const leftSide = await chain(g)(chain(f)(m));
      const rightSide = await chain(x => chain(g)(f(x)))(m);
      
      expect(leftSide).toEqual(rightSide);
    });
  });
});
