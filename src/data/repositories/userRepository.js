const { User } = require('../models');

const createUser = async (userData) => {
  return await User.create(userData);
};

const getUserById = async (id) => {
  return await User.findByPk(id);
};

const getUserByEmail = async (email) => {
  return await User.findOne({ where: { email } });
};

const getAllUsers = async () => {
  return await User.findAll({
    order: [['createdAt', 'DESC']]
  });
};

const updateUser = async (id, updateData) => {
  const [updatedRowsCount, updatedRows] = await User.update(updateData, {
    where: { id },
    returning: true
  });
  return updatedRowsCount > 0 ? updatedRows[0] : null;
};

const deleteUser = async (id) => {
  const deletedRowsCount = await User.destroy({
    where: { id }
  });
  return deletedRowsCount > 0;
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  getAllUsers,
  updateUser,
  deleteUser
};
