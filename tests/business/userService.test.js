/* global jest, beforeEach */
const userService = require('../../src/business/services/userService');
const userRepository = require('../../src/data/repositories/userRepository');
const { ERROR_TYPES } = require('../../src/utils/errors');

jest.mock('../../src/data/repositories/userRepository');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUserService', () => {
    it('should create a user when input is valid and email is unique', async () => {
      userRepository.getUserByEmail.mockResolvedValue(null);
      userRepository.createUser.mockResolvedValue({
        id: 1, name: 'Alice', age: 30, email: 'alice@example.com', toJSON: function() { return this; }
      });

      const input = { name: 'Alice', age: 30, email: 'alice@example.com' };
      const result = await userService.createUserService(input);

      expect(userRepository.getUserByEmail).toHaveBeenCalledWith('alice@example.com');
      expect(userRepository.createUser).toHaveBeenCalledWith(input);
      expect(result.id).toBe(1);
      expect(result.name).toEqual('Alice');
    });

    it('should throw CONFLICT error if email already exists', async () => {
      userRepository.getUserByEmail.mockResolvedValue({ id: 2, email: 'alice@example.com' });

      const input = { name: 'Alice', age: 30, email: 'alice@example.com' };
      await expect(userService.createUserService(input)).rejects.toMatchObject({
        type: ERROR_TYPES.CONFLICT
      });
    });

    it('should throw VALIDATION_ERROR if email format is invalid', async () => {
      const input = { name: 'Alice', age: 30, email: 'invalid-email' };
      await expect(userService.createUserService(input)).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR
      });
    });
  });

  describe('updateUserService', () => {
    it('should update a user when valid and email is unique', async () => {
      userRepository.getUserById.mockResolvedValue({ id: 1, email: 'alice@example.com' });
      userRepository.getUserByEmail.mockResolvedValue(null);
      userRepository.updateUser.mockResolvedValue({
        id: 1, name: 'Alice Updated', age: 31, email: 'newalice@example.com', toJSON: function() { return this; }
      });

      const input = { name: 'Alice Updated', age: 31, email: 'newalice@example.com' };
      const result = await userService.updateUserService(1, input);

      expect(userRepository.updateUser).toHaveBeenCalledWith(1, input);
      expect(result.email).toEqual('newalice@example.com');
    });

    it('should throw CONFLICT error if new email already exists for another user', async () => {
      userRepository.getUserById.mockResolvedValue({ id: 1, email: 'alice@example.com' });
      userRepository.getUserByEmail.mockResolvedValue({ id: 2, email: 'newalice@example.com' });

      const input = { email: 'newalice@example.com' };
      await expect(userService.updateUserService(1, input)).rejects.toMatchObject({
        type: ERROR_TYPES.CONFLICT
      });
    });

    it('should throw VALIDATION_ERROR if update body is empty', async () => {
      userRepository.getUserById.mockResolvedValue({ id: 1, email: 'alice@example.com' });
      await expect(userService.updateUserService(1, {})).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR
      });
    });
  });

  describe('getUserService and deleteUserService', () => {
    it('should throw NOT_FOUND error when user does not exist on get', async () => {
      userRepository.getUserById.mockResolvedValue(null);
      await expect(userService.getUserService(99)).rejects.toMatchObject({
        type: ERROR_TYPES.NOT_FOUND
      });
    });

    it('should throw NOT_FOUND error when user does not exist on delete', async () => {
      userRepository.deleteUser.mockResolvedValue(false);
      await expect(userService.deleteUserService(99)).rejects.toMatchObject({
        type: ERROR_TYPES.NOT_FOUND
      });
    });
  });
});
