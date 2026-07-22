/* global jest, beforeEach */
const { requestLogger } = require('../../../src/presentation/middlewares/requestLogger');
const logger = require('../../../src/utils/logger');

jest.mock('../../../src/utils/logger');

describe('requestLogger Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call next() and log after response finishes', () => {
    const req = {
      method: 'GET',
      originalUrl: '/api/test'
    };

    let finishCallback;
    const res = {
      statusCode: 200,
      on: jest.fn((event, cb) => {
        if (event === 'finish') finishCallback = cb;
      })
    };
    const next = jest.fn();

    requestLogger(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
    expect(logger.info).not.toHaveBeenCalled();

    // Trigger the finish event
    finishCallback();

    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('HTTP GET /api/test 200'));
  });
});
