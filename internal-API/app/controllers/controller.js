const md5 = require("md5");
const uuidv1 = require("uuid/v1");
const uuidv4 = require("uuid-random");

module.exports = class controller {
  constructor() {
    this.Sequelize = require(`${config.path.models}/index`).Sequelize;

    this.models = {
      VM: require(`${config.path.models}/vm`),
    };
  }

};
