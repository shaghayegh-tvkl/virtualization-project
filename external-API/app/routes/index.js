const express = require("express");
const router = express.Router();

const v1RoutesHandler = require("./v1/index");


// ip:port/api/v1/
router.use("/v1", v1RoutesHandler);

module.exports = router;