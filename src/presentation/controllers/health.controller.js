const getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Pathfinder Backend API is running'
  });
};

module.exports = { getHealth };
