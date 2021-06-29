const express = require(`express`);
const router = express.Router();

const vmController = require(`${config.path.controllers}/v1/vmController`);

// ip:port/api/v1/

// Create a new VM
router.post("/vm", vmController.createVM.bind(vmController));

// Check if VM has been created 
// router.post("/vm/status", vmController.checkVMStatus.bind(vmController));

// Check if VM has been assigned an IP 
router.post("/vm/ip", vmController.checkVMIP.bind(vmController));



module.exports = router;
