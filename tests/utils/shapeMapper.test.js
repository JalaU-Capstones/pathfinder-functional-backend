const { toApiPosition, toDbPosition } = require('../../src/utils/shapeMapper');

describe('shapeMapper', () => {
  describe('toApiPosition', () => {
    it('should return null when input is undefined', () => {
      expect(toApiPosition(undefined)).toBeNull();
    });

    it('should return null when positionX is undefined', () => {
      expect(toApiPosition({ positionY: 10 })).toBeNull();
    });

    it('should return null when positionY is undefined', () => {
      expect(toApiPosition({ positionX: 10 })).toBeNull();
    });

    it('should map to { x, y } when both are present', () => {
      expect(toApiPosition({ positionX: 10, positionY: 20 })).toEqual({ x: 10, y: 20 });
    });
  });

  describe('toDbPosition', () => {
    it('should return undefined positions when apiPosition is missing', () => {
      expect(toDbPosition(undefined)).toEqual({ positionX: undefined, positionY: undefined });
    });

    it('should map to { positionX, positionY } when present', () => {
      expect(toDbPosition({ x: 10, y: 20 })).toEqual({ positionX: 10, positionY: 20 });
    });
  });
});
