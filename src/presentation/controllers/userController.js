const userService = require('../../business/services/userService');
const { sendSuccess } = require('../../utils/httpResponse');

const createUser = async (req, res, next) => {
  try {
    const userData = req.body;
    const newUser = await userService.createUserService(userData);
    return sendSuccess(res, 201, newUser);
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserService(id);
    return sendSuccess(res, 200, user);
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsersService();
    return sendSuccess(res, 200, users);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedUser = await userService.updateUserService(id, updateData);
    return sendSuccess(res, 200, updatedUser);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await userService.deleteUserService(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser
};
