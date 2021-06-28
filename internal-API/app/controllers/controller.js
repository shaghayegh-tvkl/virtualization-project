module.exports = class controller {
  constructor() {
    this.Sequelize = require(`${config.path.models}/index`).Sequelize;

    this.models = {
      VM: require(`${config.path.models}/vm`),
    };
  }

};
