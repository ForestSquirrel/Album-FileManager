const { DataTypes } = require('sequelize');
const { sequelize } = require('./pgInstance');
const bcrypt = require('bcrypt');

// Define the User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Hash the password before saving the user
User.beforeCreate(async (user, options) => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(user.password, saltRounds);
  user.password = hashedPassword;
});

const Photo = sequelize.define('Photo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  folder_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

const Folder = sequelize.define('Folder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

// Associations

Folder.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Folder, { foreignKey: 'user_id', onDelete: 'CASCADE' });

Folder.hasMany(Folder, { as: 'subfolders', foreignKey: 'parent_id', onDelete: 'CASCADE' });
Folder.belongsTo(Folder, { as: 'parentFolder', foreignKey: 'parent_id' });

Folder.hasMany(Photo, { foreignKey: 'folder_id', onDelete: 'CASCADE' });
Photo.belongsTo(Folder, { foreignKey: 'folder_id' });

Photo.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Photo, {foreignKey: 'user_id', onDelete: 'CASCADE'})

module.exports = {
  User,
  Photo,
  Folder
}
