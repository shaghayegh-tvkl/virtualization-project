const path = require("path");

module.exports = {
  ip: "0.0.0.0",
  port: 8000,

  path: {
    models: path.resolve("./app/models"),
    data: path.resolve("./app/data"),
    controllers: path.resolve("./app/controllers"),
    routes: path.resolve("./app/routes"),
  },

  database: {
    host: "192.168.54.21",
    port: "5432",
    schema: "vm",
    username: "postgres",
    password: "password",
  },

  api: {
    IP: "http://localhost:8000/api/employee/getsubemployee",
    VM: "http://192.168.96.240:8000/api/employee/getemployeestatus"
  }
};
