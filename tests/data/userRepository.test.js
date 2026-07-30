/* global jest, beforeEach */
const userRepository = require('../../src/data/repositories/userRepository');
const { User } = require('../../src/data/models');

jest.mock('../../src/data/models', () => {
  return {
    User: {
      create: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn()
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
      User.create.mockResolvedValue({ id: 1, ...data });

      const result = await userRepository.createUser(data);
      expect(User.create).toHaveBeenCalledWith(data);
      expect(result.id).toBe(1);
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
      User.findByPk.mockResolvedValue({ id: 1, email: 'test@example.com' });
      const result = await userRepository.getUserById(1);
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(result.email).toBe('test@example.com');
    });

    it('should return null when user is not found', async () => {
      User.findByPk.mockResolvedValue(null);
      const result = await userRepository.getUserById(999);
      expect(User.findByPk).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should call User.findOne with email and return a user', async () => {
      User.findOne.mockResolvedValue({ id: 1, email: 'test@example.com' });
      const result = await userRepository.getUserByEmail('test@example.com');
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result.id).toBe(1);
    });

    it('should return null when user is not found by email', async () => {
      User.findOne.mockResolvedValue(null);
      const result = await userRepository.getUserByEmail('notfound@example.com');
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'notfound@example.com' } });
      expect(result).toBeNull();
    });
  });

  describe('getAllUsers', () => {
    it('should call User.findAll and return array of users', async () => {
      User.findAll.mockResolvedValue([]);
      const result = await userRepository.getAllUsers();
      expect(User.findAll).toHaveBeenCalledWith({ order: [['createdAt', 'DESC']] });
      expect(result).toEqual([]);
    });
  });

  describe('updateUser', () => {
    it('should call User.update and return updated row', async () => {
      const data = { email: 'updated@example.com' };
      User.update.mockResolvedValue([1, [{ id: 1, ...data }]]);
      const result = await userRepository.updateUser(1, data);
      expect(User.update).toHaveBeenCalledWith(data, { where: { id: 1 }, returning: true });
      expect(result.email).toBe('updated@example.com');
    });

    it('should return null if no rows updated', async () => {
      User.update.mockResolvedValue([0, []]);
      const result = await userRepository.updateUser(999, {});
      expect(result).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('should call User.destroy and return true if deleted', async () => {
      User.destroy.mockResolvedValue(1);
      const result = await userRepository.deleteUser(1);
      expect(User.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBe(true);
    });

    it('should return false if no row deleted', async () => {
      User.destroy.mockResolvedValue(0);
      const result = await userRepository.deleteUser(999);
      expect(User.destroy).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(result).toBe(false);
    });
  });
});
