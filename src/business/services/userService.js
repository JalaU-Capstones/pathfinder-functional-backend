const userRepository = require('../../data/repositories/userRepository');
const { ERROR_TYPES, createAppError } = require('../../utils/errors');
const { isValidEmail } = require('../../utils/validation');

const toApiShape = (dbUser) => {
  if (!dbUser) return null;
  const raw = dbUser.toJSON ? dbUser.toJSON() : dbUser;
  return {
    id: raw.id,
    name: raw.name,
    age: raw.age,
    email: raw.email,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt
  };
};

const toDbShape = (apiData) => {
  return {
    name: apiData.name,
    age: apiData.age,
    email: apiData.email
  };
};

const validateUserCreate = (data) => {
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Name is required and must be a non-empty string.');
  }
  if (!data.age || !Number.isInteger(data.age) || data.age <= 0) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Age is required and must be a positive integer.');
  }
  if (!data.email || !isValidEmail(data.email)) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Email is required and must be a valid email format.');
  }
};

const validateUserUpdate = (data) => {
  if (Object.keys(data).length === 0) {
    throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'At least one field must be provided for update.');
  }
  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim() === '') {
      throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Name must be a non-empty string.');
    }
  }
  if (data.age !== undefined) {
    if (!Number.isInteger(data.age) || data.age <= 0) {
      throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Age must be a positive integer.');
    }
  }
  if (data.email !== undefined) {
    if (!isValidEmail(data.email)) {
      throw createAppError(ERROR_TYPES.VALIDATION_ERROR, 'Email must be a valid email format.');
    }
  }
};

const createUserService = async (userData) => {
  validateUserCreate(userData);

  const existingUser = await userRepository.getUserByEmail(userData.email);
  if (existingUser) {
    throw createAppError(ERROR_TYPES.CONFLICT, 'A user with this email already exists.');
  }

  const dbShape = toDbShape(userData);
  const newUser = await userRepository.createUser(dbShape);
  return toApiShape(newUser);
};

const getUserService = async (id) => {
  const user = await userRepository.getUserById(id);
  if (!user) {
    throw createAppError(ERROR_TYPES.NOT_FOUND, `User with ID ${id} not found.`);
  }
  return toApiShape(user);
};

const getAllUsersService = async () => {
  const users = await userRepository.getAllUsers();
  return users.map(toApiShape);
};

const updateUserService = async (id, updateData) => {
  const existingUser = await userRepository.getUserById(id);
  if (!existingUser) {
    throw createAppError(ERROR_TYPES.NOT_FOUND, `User with ID ${id} not found.`);
  }

  validateUserUpdate(updateData);

  if (updateData.email && updateData.email !== existingUser.email) {
    const existingEmailUser = await userRepository.getUserByEmail(updateData.email);
    if (existingEmailUser) {
      throw createAppError(ERROR_TYPES.CONFLICT, 'A user with this email already exists.');
    }
  }

  // We only pass fields that are present in updateData to toDbShape, avoiding overwriting with undefined
  const dbShape = {};
  if (updateData.name !== undefined) dbShape.name = updateData.name;
  if (updateData.age !== undefined) dbShape.age = updateData.age;
  if (updateData.email !== undefined) dbShape.email = updateData.email;

  const updatedUser = await userRepository.updateUser(id, dbShape);
  return toApiShape(updatedUser);
};

const deleteUserService = async (id) => {
  const deleted = await userRepository.deleteUser(id);
  if (!deleted) {
    throw createAppError(ERROR_TYPES.NOT_FOUND, `User with ID ${id} not found.`);
  }
  return true;
};

module.exports = {
  createUserService,
  getUserService,
  getAllUsersService,
  updateUserService,
  deleteUserService,
  toApiShape,
  toDbShape
};
