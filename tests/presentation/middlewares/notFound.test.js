/* global jest */
const { notFound } = require('../../../src/presentation/middlewares/notFound');
const { ERROR_TYPES } = require('../../../src/utils/errors');

describe('notFound Middleware', () => {
  it('should forward a typed NOT_FOUND error via next()', () => {
    const req = {
      method: 'POST',
      originalUrl: '/api/invalid'
    };
    const res = {};
    const next = jest.fn();

    notFound(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const errArg = next.mock.calls[0][0];
    
    expect(errArg.isAppError).toBe(true);
    expect(errArg.type).toBe(ERROR_TYPES.NOT_FOUND);
    expect(errArg.message).toBe('Route POST /api/invalid not found');
  });
});
