/* global jest, beforeEach */
const { sendSuccess, sendError } = require('../../src/utils/httpResponse');
const { ERROR_TYPES, createAppError } = require('../../src/utils/errors');

describe('httpResponse', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('sendSuccess', () => {
    it('should send 200 and data', () => {
      sendSuccess(mockRes, 201, { key: 'value' });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: { key: 'value' } });
    });

    it('should use default parameters 200 and null data', () => {
      sendSuccess(mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: null });
    });
  });

  describe('sendError', () => {
    it('should handle NOT_FOUND', () => {
      const error = createAppError(ERROR_TYPES.NOT_FOUND, 'Not found msg');
      sendError(mockRes, error);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({ type: ERROR_TYPES.NOT_FOUND, message: 'Not found msg' })
      }));
    });

    it('should handle VALIDATION_ERROR', () => {
      const error = createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Invalid msg');
      sendError(mockRes, error);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should handle CONFLICT', () => {
      const error = createAppError(ERROR_TYPES.CONFLICT, 'Conflict msg');
      sendError(mockRes, error);
      expect(mockRes.status).toHaveBeenCalledWith(409);
    });

    it('should handle INTERNAL_ERROR', () => {
      const error = createAppError(ERROR_TYPES.INTERNAL_ERROR, 'Internal msg');
      sendError(mockRes, error);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it('should handle fallback for unknown app error type', () => {
      const error = createAppError('UNKNOWN', 'Unknown msg');
      sendError(mockRes, error);
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it('should handle generic unhandled errors', () => {
      const error = new Error('Raw error');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      sendError(mockRes, error);
      expect(consoleSpy).toHaveBeenCalledWith('Unhandled Error:', error);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({ type: ERROR_TYPES.INTERNAL_ERROR })
      }));
      consoleSpy.mockRestore();
    });
  });
});
