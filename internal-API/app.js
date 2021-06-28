const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const log4js = require("log4js");
const apiMetrics = require('prometheus-api-metrics');

const app = express();

global.config = require("./app/config");

log4js.configure({
  appenders: {
    vm: {
      type: "file",
      filename: path.join(__dirname, "logs", "vm.log"),
    },
    database: {
      type: "file",
      filename: path.join(__dirname, "logs", "database.log"),
    },
    default: {
      type: "file",
      filename: path.join(__dirname, "logs", "all.log"),
    },
  },
  categories: {
    vm: { appenders: ["vm"], level: "info" },
    database: { appenders: ["database"], level: "info" },
    all: { appenders: ["default"], level: "info" },
    default: { appenders: ["default"], level: "info" },
  },
});

const logger = log4js.getLogger("all");
app.use(log4js.connectLogger(logger, { level: "info" }));


const modelHandler = require(`${config.path.models}/index`);
const routesHandler = require(`${config.path.routes}/index`);

const redisDatabase = require(`${config.path.models}/RedisDB`);
const redisDatabaseObj = new redisDatabase();
redisDatabaseObj.connectToDatabase();

const swaggerUi = require("swagger-ui-express"), swaggerDocument = require("../doc/internal-API.json");
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.use(apiMetrics());


app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,x-access-token"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


app.use("/api", routesHandler);
app.all("*", (req, res) => {
  return res.status(404).json({
    success: false,
    msg: "not found*",
  });
});

process.on('uncaughtException', function (err) {
  if (err) {
      logger.error("Uncaught Exception: ", err.stack)
      console.log("Uncaught Exception: ", err.stack)
  }
});

app.listen(config.port, config.ip, () => {
  console.log(`internal-API is running on port: ${config.port}`);

  // Connect to database
  modelHandler.connect();

  // Create tables
  // modelHandler.sync();

});