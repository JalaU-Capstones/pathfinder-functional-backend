const { compose, pipe } = require('../../../src/utils/compose');

describe('Function Composition Utilities', () => {
  describe('compose', () => {
    it('applies functions from right to left', () => {
      const add1 = (x) => x + 1;
      const multiply2 = (x) => x * 2;
      const subtract3 = (x) => x - 3;
      
      const composed = compose(subtract3, multiply2, add1);
      expect(composed(5)).toBe(9);
    });
  });

  describe('pipe', () => {
    it('applies functions from left to right', () => {
      const add1 = (x) => x + 1;
      const multiply2 = (x) => x * 2;
      const subtract3 = (x) => x - 3;
      
      const piped = pipe(add1, multiply2, subtract3);
      expect(piped(5)).toBe(9);
    });

    it('with a single function is identity-equivalent (returns the function result)', () => {
      const add1 = (x) => x + 1;
      const piped = pipe(add1);
      expect(piped(5)).toBe(6);
    });

    it('with zero functions returns the initial value (identity)', () => {
      const piped = pipe();
      expect(piped(5)).toBe(5);
    });
  });
});
