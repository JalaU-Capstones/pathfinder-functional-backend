const userService = require('../../business/services/userService');
const { sendSuccess, sendError } = require('../../utils/httpResponse');

const createUser = async (req, res) => {
  try {
    const userData = req.body;
    const newUser = await userService.createUserService(userData);
    return sendSuccess(res, 201, newUser);
  } catch (error) {
    return sendError(res, error);
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserService(id);
    return sendSuccess(res, 200, user);
  } catch (error) {
    return sendError(res, error);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsersService();
    return sendSuccess(res, 200, users);
  } catch (error) {
    return sendError(res, error);
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedUser = await userService.updateUserService(id, updateData);
    return sendSuccess(res, 200, updatedUser);
  } catch (error) {
    return sendError(res, error);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await userService.deleteUserService(id);
    return res.status(204).send();
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  createUser,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser
};
