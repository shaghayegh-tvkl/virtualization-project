const Sequelize = require("sequelize");
const db = {};

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
      console.log("Connection has been established successfully.");
    })
    .catch((error) => {
      console.log("Unable to connect to the database: ", error);
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