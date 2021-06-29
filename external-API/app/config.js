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

  redis: {
    host: "192.168.54.21",
    port: "6379",
    index: 0

  },

  api: {
    IP: "http://192.168.54.21:8000/api/v1/vm/ip",
    create: "http://192.168.54.21:8000/api/v1/vm"
  }
};
