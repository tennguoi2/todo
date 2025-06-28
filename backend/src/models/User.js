const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: true, // Can be null for Google OAuth users
    },
    google_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: "users",
    hooks: {
      beforeCreate: async (user) => {
        if (user.password_hash) {
          user.password_hash = await bcrypt.hash(user.password_hash, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password_hash") && user.password_hash) {
          user.password_hash = await bcrypt.hash(user.password_hash, 10);
        }
      },
    },
  },
);

// Instance methods
User.prototype.validatePassword = async function (password) {
  if (!this.password_hash) return false;
  return await bcrypt.compare(password, this.password_hash);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password_hash;
  return values;
};

module.exports = User;
