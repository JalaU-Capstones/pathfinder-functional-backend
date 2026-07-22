/* global jest, beforeEach, afterEach */
const { errorHandler } = require('../../../src/presentation/middlewares/errorHandler');
const logger = require('../../../src/utils/logger');
const { createAppError, ERROR_TYPES } = require('../../../src/utils/errors');

jest.mock('../../../src/utils/logger');

describe('errorHandler Middleware', () => {
  let req, res, next;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should handle 400 validation error', () => {
    const err = createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Invalid input');
    
    errorHandler(err, req, res, next);

    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('VALIDATION_ERROR: Invalid input'));
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input'
      }
    });
  });

  it('should handle 404 not found error', () => {
    const err = createAppError(ERROR_TYPES.NOT_FOUND, 'User not found');
    
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: expect.objectContaining({
        code: 'NOT_FOUND',
        message: 'User not found'
      })
    });
  });

  it('should handle 409 conflict error', () => {
    const err = createAppError(ERROR_TYPES.CONFLICT, 'Email already exists');
    
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: expect.objectContaining({
        code: 'CONFLICT',
        message: 'Email already exists'
      })
    });
  });

  it('should handle 500 unexpected error and hide stack in production', () => {
    process.env.NODE_ENV = 'production';
    const err = new Error('Raw unhandled error');
    err.stack = 'Error stack trace details';

    errorHandler(err, req, res, next);

    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('INTERNAL_ERROR'));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  });

  it('should handle 500 unexpected error and show stack in development', () => {
    process.env.NODE_ENV = 'development';
    const err = new Error('Raw unhandled error');
    err.stack = 'Error stack trace details';

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        stack: 'Error stack trace details'
      }
    });
  });
});
