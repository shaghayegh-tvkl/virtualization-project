const db = require(`${config.path.models}/index`);

const Sequelize = db.Sequelize;
const sequelize = db.sequelize;

const model = Sequelize.Model;

class VM extends model { }
VM.init(
  {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: {
      type: Sequelize.STRING(10),
      allowNull: false
    },
    ram: {
      type: Sequelize.STRING(10),
      allowNull: true
    },
    cpu: {
      type: Sequelize.STRING(10),
      allowNull: true
    },
    disk: {
      type: Sequelize.STRING(10),
      allowNull: true
    },
    ip: {
      type: Sequelize.STRING(20),
      allowNull: true
    },
    status: {
      type: Sequelize.STRING(10),
      allowNull: true
    },
    active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },

  },
  {
    sequelize,
    modelName: "VM",
    tableName: "vm",
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = VM;
