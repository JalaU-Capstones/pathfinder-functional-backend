const { curry, isWithinBound, isPointInGrid, isSamePoint } = require('../../../src/utils/curry');

describe('Currying Utilities', () => {
  describe('curry', () => {
    it('transforms f(a, b) into f(a)(b)', () => {
      const add = (a, b) => a + b;
      const curriedAdd = curry(add);
      
      expect(curriedAdd(2)(3)).toBe(5);
      expect(curriedAdd(2, 3)).toBe(5);
    });
  });

  describe('isWithinBound', () => {
    it('returns true if value is within exclusive bound', () => {
      expect(isWithinBound(10)(5)).toBe(true);
      expect(isWithinBound(10)(0)).toBe(true);
    });
    
    it('returns false if value is outside exclusive bound', () => {
      expect(isWithinBound(10)(10)).toBe(false);
      expect(isWithinBound(10)(-1)).toBe(false);
    });
  });

  describe('isPointInGrid', () => {
    const grid = { width: 10, height: 10 };
    
    it('returns true if point is inside grid', () => {
      expect(isPointInGrid(grid)({ x: 5, y: 5 })).toBe(true);
      expect(isPointInGrid(grid)({ x: 0, y: 0 })).toBe(true);
    });
    
    it('returns false if point is outside grid', () => {
      expect(isPointInGrid(grid)({ x: 10, y: 5 })).toBe(false);
      expect(isPointInGrid(grid)({ x: 5, y: 10 })).toBe(false);
      expect(isPointInGrid(grid)({ x: -1, y: 5 })).toBe(false);
    });
  });

  describe('isSamePoint', () => {
    it('returns true for exact same coordinates', () => {
      expect(isSamePoint({ x: 1, y: 1 })({ x: 1, y: 1 })).toBe(true);
    });
    
    it('returns false for different coordinates', () => {
      expect(isSamePoint({ x: 1, y: 1 })({ x: 2, y: 1 })).toBe(false);
      expect(isSamePoint({ x: 1, y: 1 })({ x: 1, y: 2 })).toBe(false);
    });
  });
});
