const express = require("express");
const router = express.Router();

const vmRoutesHandler = require("./vm");

// VM routers
// ip:port/api/v1/vm
router.use("/", vmRoutesHandler);


module.exports = router;