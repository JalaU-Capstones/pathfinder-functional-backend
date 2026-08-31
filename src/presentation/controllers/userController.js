const userService = require('../../business/services/userService');
const { sendSuccess } = require('../../utils/httpResponse');

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.userId);
    return sendSuccess(res, 200, user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const updateData = req.body;
    const updatedUser = await userService.updateProfile(req.user.userId, updateData);
    return sendSuccess(res, 200, updatedUser);
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    await userService.deleteAccount(req.user.userId);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount
};
