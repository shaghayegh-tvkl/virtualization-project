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

  generateCode(parameter) {
    let now = Date.now();
    let code = md5(parameter + now);

    return code;
  }

  generateTimestampUUID() {
    let uuid = uuidv1();

    return uuid;
  }

  generateRandomUUID() {
    let uuid = uuidv4();

    return uuid;
  }

};
