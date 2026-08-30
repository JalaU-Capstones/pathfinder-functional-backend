/* global jest, beforeEach */
const userService = require('../../src/business/services/userService');
const userRepository = require('../../src/data/repositories/userRepository');
const { ERROR_TYPES } = require('../../src/utils/errors');

jest.mock('../../src/data/repositories/userRepository');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });



  describe('updateUserService', () => {
    it('should update a user when valid and email is unique', async () => {
      userRepository.getUserById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', email: 'alice@example.com' });
      userRepository.getUserByEmail.mockResolvedValue(null);
      userRepository.updateUser.mockResolvedValue({
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', name: 'Alice Updated', age: 31, email: 'newalice@example.com', toJSON: function() { return this; }
      });

      const input = { name: 'Alice Updated', age: 31, email: 'newalice@example.com' };
      const result = await userService.updateUserService(1, input);

      expect(userRepository.updateUser).toHaveBeenCalledWith(1, input);
      expect(result.email).toEqual('newalice@example.com');
    });

    it('should throw CONFLICT error if new email already exists for another user', async () => {
      userRepository.getUserById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', email: 'alice@example.com' });
      userRepository.getUserByEmail.mockResolvedValue({ id: 2, email: 'newalice@example.com' });

      const input = { email: 'newalice@example.com' };
      await expect(userService.updateUserService(1, input)).rejects.toMatchObject({
        type: ERROR_TYPES.CONFLICT
      });
    });

    it('should throw VALIDATION_ERROR if update body is empty', async () => {
      userRepository.getUserById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', email: 'alice@example.com' });
      await expect(userService.updateUserService(1, {})).rejects.toMatchObject({
        type: ERROR_TYPES.VALIDATION_ERROR
      });
    });

    it('should throw NOT_FOUND if user to update does not exist', async () => {
      userRepository.getUserById.mockResolvedValue(null);
      await expect(userService.updateUserService(99, { name: 'A' })).rejects.toMatchObject({ type: ERROR_TYPES.NOT_FOUND });
    });

    it('should throw VALIDATION_ERROR if updated name is invalid', async () => {
      userRepository.getUserById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', email: 'a@b.com' });
      await expect(userService.updateUserService(1, { name: ' ' })).rejects.toMatchObject({ type: ERROR_TYPES.VALIDATION_ERROR });
    });

    it('should throw VALIDATION_ERROR if updated age is negative', async () => {
      userRepository.getUserById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', email: 'a@b.com' });
      await expect(userService.updateUserService(1, { age: -5 })).rejects.toMatchObject({ type: ERROR_TYPES.VALIDATION_ERROR });
    });

    it('should throw VALIDATION_ERROR if updated email is invalid format', async () => {
      userRepository.getUserById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', email: 'a@b.com' });
      await expect(userService.updateUserService(1, { email: 'bad' })).rejects.toMatchObject({ type: ERROR_TYPES.VALIDATION_ERROR });
    });

    it('should update name only', async () => {
      userRepository.getUserById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', email: 'a@b.com' });
      userRepository.updateUser.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', name: 'Alice2', age: 30, email: 'a@b.com', toJSON: function() { return this; } });
      const result = await userService.updateUserService(1, { name: 'Alice2' });
      expect(result.name).toBe('Alice2');
    });

    it('should update age only', async () => {
      userRepository.getUserById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', email: 'a@b.com' });
      userRepository.updateUser.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', name: 'Alice', age: 31, email: 'a@b.com', toJSON: function() { return this; } });
      const result = await userService.updateUserService(1, { age: 31 });
      expect(result.age).toBe(31);
    });
  });

  describe('getAllUsersService', () => {
    it('should return all users mapped to API shape', async () => {
      userRepository.getAllUsers.mockResolvedValue([{ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', name: 'A', toJSON: function() { return this; } }]);
      const result = await userService.getAllUsersService();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
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

    it('should return user when found on get', async () => {
      userRepository.getUserById.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', name: 'A', toJSON: function() { return this; } });
      const result = await userService.getUserService(1);
      expect(result.id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
    });

    it('should return true when user is deleted', async () => {
      userRepository.deleteUser.mockResolvedValue(true);
      const result = await userService.deleteUserService(1);
      expect(result).toBe(true);
    });
  });

  describe('toApiShape', () => {
    it('should return null if input is falsy', () => {
      expect(userService.toApiShape(null)).toBeNull();
    });

    it('should handle input without toJSON method', () => {
      const input = { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', name: 'A', age: 30, email: 'a@b.com' };
      const result = userService.toApiShape(input);
      expect(result.id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(result.name).toBe('A');
    });
  });
});
