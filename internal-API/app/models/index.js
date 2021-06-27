const Sequelize = require("sequelize");
const db = {};
var log4js = require("log4js")
var logger = log4js.getLogger("database")


const sequelize = new Sequelize({
  dialect: "postgres",
  host: config.database.host,
  port: config.database.port,
  database: config.database.schema,
  username: config.database.username,
  password: config.database.password,

});

const connect = async () => {
  await sequelize
    .authenticate()
    .then(() => {
      logger.info("Connection to Postgres has been established successfully.");
      console.log("Connection to Postgres has been established successfully.");
      
    })
    .catch((error) => { 
      logger.info("Unable to connect to postgres: ", error);
      console.log("Unable to connect to postgres: ", error);
    });
};

const sync = async () => {
  const VM = require(`${config.path.models}/vm`);

  // Create vm table
  await VM.sync();

};

db.connect = connect;
db.sync = sync;
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;