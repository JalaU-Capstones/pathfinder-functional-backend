/* global jest, beforeEach */
'use strict';

const userRepository = require('../../../src/data/repositories/userRepository');
const { User } = require('../../../src/data/models');

jest.mock('../../../src/data/models', () => {
  return {
    User: {
      create: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      unscoped: jest.fn(() => ({ findOne: jest.fn() }))
    }
  };
});

describe('User Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create and return a user', async () => {
      const data = { email: 'test@example.com' };
      User.create.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', ...data });

      const result = await userRepository.createUser(data);
      expect(User.create).toHaveBeenCalledWith(data);
      expect(result.id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
    });

    it('should propagate errors from Sequelize', async () => {
      const data = { email: 'test@example.com' };
      const error = new Error('Sequelize error');
      User.create.mockRejectedValue(error);

      await expect(userRepository.createUser(data)).rejects.toThrow('Sequelize error');
      expect(User.create).toHaveBeenCalledWith(data);
    });
  });

  describe('getUserById', () => {
    it('should call User.findByPk and return a user', async () => {
      User.findByPk.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', email: 'test@example.com' });
      const result = await userRepository.getUserById('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(User.findByPk).toHaveBeenCalledWith('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(result.email).toBe('test@example.com');
    });

    it('should return null when user is not found', async () => {
      User.findByPk.mockResolvedValue(null);
      const result = await userRepository.getUserById('99999999-9999-9999-9999-999999999999');
      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should call User.findOne with email and return a user', async () => {
      User.findOne.mockResolvedValue({ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', email: 'test@example.com' });
      const result = await userRepository.getUserByEmail('test@example.com');
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result.id).toBe('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
    });

    it('should return null when user is not found by email', async () => {
      User.findOne.mockResolvedValue(null);
      const result = await userRepository.getUserByEmail('notfound@example.com');
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'notfound@example.com' } });
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should call User.update and return updated row', async () => {
      const data = { email: 'updated@example.com' };
      User.update.mockResolvedValue([1, [{ id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799', ...data }]]);
      const result = await userRepository.updateUser('3b47e69f-788d-4b19-b81b-0b4a2fd92799', data);
      expect(User.update).toHaveBeenCalledWith(data, { where: { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' }, returning: true });
      expect(result.email).toBe('updated@example.com');
    });

    it('should return null if no rows updated', async () => {
      User.update.mockResolvedValue([0, []]);
      const result = await userRepository.updateUser('99999999-9999-9999-9999-999999999999', {});
      expect(result).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('should call User.destroy and return true if deleted', async () => {
      User.destroy.mockResolvedValue(1);
      const result = await userRepository.deleteUser('3b47e69f-788d-4b19-b81b-0b4a2fd92799');
      expect(User.destroy).toHaveBeenCalledWith({ where: { id: '3b47e69f-788d-4b19-b81b-0b4a2fd92799' } });
      expect(result).toBe(true);
    });

    it('should return false if no row deleted', async () => {
      User.destroy.mockResolvedValue(0);
      const result = await userRepository.deleteUser('99999999-9999-9999-9999-999999999999');
      expect(User.destroy).toHaveBeenCalledWith({ where: { id: '99999999-9999-9999-9999-999999999999' } });
      expect(result).toBe(false);
    });
  });
});
