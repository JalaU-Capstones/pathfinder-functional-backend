const { Map } = require('../models');

const createMap = async (mapData) => {
  return await Map.create(mapData);
};

const getMapById = async (id) => {
  return await Map.findByPk(id);
};

const getAllMaps = async () => {
  return await Map.findAll({ order: [['createdAt', 'DESC']] });
};

const updateMap = async (id, updateData) => {
  const [updatedRowsCount, updatedRows] = await Map.update(updateData, {
    where: { id },
    returning: true
  });
  return updatedRowsCount > 0 ? updatedRows[0] : null;
};

const deleteMap = async (id) => {
  const deletedRowsCount = await Map.destroy({
    where: { id }
  });
  return deletedRowsCount > 0;
};

module.exports = {
  createMap,
  getMapById,
  getAllMaps,
  updateMap,
  deleteMap
};
