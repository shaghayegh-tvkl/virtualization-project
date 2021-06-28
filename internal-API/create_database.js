global.config = require("./app/config");
const modelHandler = require(`${config.path.models}/index`);

// Create tables
modelHandler.sync();
