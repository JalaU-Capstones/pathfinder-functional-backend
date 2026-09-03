/* global jest, beforeEach */
'use strict';

const userService = require('../../../src/business/services/userService');
const userRepository = require('../../../src/data/repositories/userRepository');
const { ERROR_TYPES } = require('../../../src/utils/errors');

jest.mock('../../../src/data/repositories/userRepository');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  describe('getProfile', () => {
    it('should return the user when found', async () => {
      userRepository.getUserById.mockResolvedValue({
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        name: 'Alice',
        age: 30,
        email: 'alice@example.com',
        toJSON: function () { return this; }
      });

      const result = await userService.getProfile('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(result.id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(userRepository.getUserById).toHaveBeenCalledWith('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
    });

    it('should throw NOT_FOUND when user does not exist', async () => {
      userRepository.getUserById.mockResolvedValue(null);
      await expect(userService.getProfile('99999999-9999-9999-9999-999999999999')).rejects.toMatchObject({
        type: ERROR_TYPES.NOT_FOUND
      });
    });
  });

  describe('updateProfile', () => {
    it('should update a user when valid and email is unique', async () => {
      userRepository.getUserById.mockResolvedValue({
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        email: 'alice@example.com'
      });
      userRepository.getUserByEmail.mockResolvedValue(null);
      userRepository.updateUser.mockResolvedValue({
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        name: 'Alice Updated',
        age: 31,
        email: 'newalice@example.com',
        toJSON: function () { return this; }
      });

      const result = await userService.updateProfile('3b47e69f-788d-4b19-b81b-0b4a2fd92799', {
        name: 'Alice Updated', age: 31, email: 'newalice@example.com'
      });

      expect(result.email).toEqual('newalice@example.com');
    });

    it('should throw CONFLICT if new email already used by another user', async () => {
      userRepository.getUserById.mockResolvedValue({
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        email: 'alice@example.com'
      });
      userRepository.getUserByEmail.mockResolvedValue({
        id: 'different-user',
        email: 'newalice@example.com'
      });

      await expect(
        userService.updateProfile('3b47e69f-788d-4b19-b81b-0b4a2fd92799', { email: 'newalice@example.com' })
      ).rejects.toMatchObject({ type: ERROR_TYPES.CONFLICT });
    });

    it('should throw VALIDATION_ERROR if update body is empty', async () => {
      userRepository.getUserById.mockResolvedValue({
        id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799',
        email: 'alice@example.com'
      });
      await expect(
        userService.updateProfile('3b47e69f-788d-4b19-b81b-0b4a2fd92799', {})
      ).rejects.toMatchObject({ type: ERROR_TYPES.VALIDATION_ERROR });
    });

    it('should throw NOT_FOUND if user does not exist', async () => {
      userRepository.getUserById.mockResolvedValue(null);
      await expect(
        userService.updateProfile('99999999-9999-9999-9999-999999999999', { name: 'A' })
      ).rejects.toMatchObject({ type: ERROR_TYPES.NOT_FOUND });
    });

    it('should throw VALIDATION_ERROR if updated name is empty string', async () => {
      userRepository.getUserById.mockResolvedValue({ id: '1', email: 'a@b.com' });
      await expect(
        userService.updateProfile('1', { name: ' ' })
      ).rejects.toMatchObject({ type: ERROR_TYPES.VALIDATION_ERROR });
    });

    it('should throw VALIDATION_ERROR if updated age is negative', async () => {
      userRepository.getUserById.mockResolvedValue({ id: '1', email: 'a@b.com' });
      await expect(
        userService.updateProfile('1', { age: -5 })
      ).rejects.toMatchObject({ type: ERROR_TYPES.VALIDATION_ERROR });
    });

    it('should throw VALIDATION_ERROR if updated email is invalid', async () => {
      userRepository.getUserById.mockResolvedValue({ id: '1', email: 'a@b.com' });
      await expect(
        userService.updateProfile('1', { email: 'bad-email' })
      ).rejects.toMatchObject({ type: ERROR_TYPES.VALIDATION_ERROR });
    });

    it('should update name only', async () => {
      userRepository.getUserById.mockResolvedValue({ id: '1', email: 'a@b.com' });
      userRepository.updateUser.mockResolvedValue({
        id: '1', name: 'Alice2', age: 30, email: 'a@b.com',
        toJSON: function () { return this; }
      });
      const result = await userService.updateProfile('1', { name: 'Alice2' });
      expect(result.name).toBe('Alice2');
    });

    it('should update age only', async () => {
      userRepository.getUserById.mockResolvedValue({ id: '1', email: 'a@b.com' });
      userRepository.updateUser.mockResolvedValue({
        id: '1', name: 'Alice', age: 31, email: 'a@b.com',
        toJSON: function () { return this; }
      });
      const result = await userService.updateProfile('1', { age: 31 });
      expect(result.age).toBe(31);
    });
  });

  describe('deleteAccount', () => {
    it('should return true when user is deleted', async () => {
      userRepository.deleteUser.mockResolvedValue(true);
      const result = await userService.deleteAccount('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(result).toBe(true);
    });

    it('should throw NOT_FOUND when user does not exist', async () => {
      userRepository.deleteUser.mockResolvedValue(false);
      await expect(
        userService.deleteAccount('99999999-9999-9999-9999-999999999999')
      ).rejects.toMatchObject({ type: ERROR_TYPES.NOT_FOUND });
    });
  });
});
