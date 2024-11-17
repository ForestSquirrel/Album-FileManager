const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('postgres://album-files-db:12345@localhost:5432/album-files');

const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Import models
    const User = require('./models/user');

    // Synchronize models with the database
    await sequelize.sync();
    console.log('Database synced');
  } catch (error) {
    console.error('Unable to connect or sync to the database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  initDatabase,
};
