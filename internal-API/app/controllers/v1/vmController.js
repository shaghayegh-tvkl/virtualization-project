const Sequelize = require("sequelize");
const statusCode = require("http-status-codes");
const log4js = require("log4js");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const shell = require('shelljs')
const { exec } = require('child_process');


const op = Sequelize.Op;

const logger = log4js.getLogger("vm");

const controller = require(`${config.path.controllers}/controller`);


module.exports = new (class vmController extends controller {
    constructor() {
        super();
        this.VM = this.models.VM;

    }

    // APIs

    async createVM(req, res) {

        try {
            let data = {
                name: req.body.name,
                ram: req.body.ram,
                cpu: req.body.cpu,
                disk: req.body.disk
            };

            const redisDatabase = require(`${config.path.models}/RedisDB`);
            const redisDatabaseObj = new redisDatabase();

            redisDatabaseObj.add(config.redis.index,
                data.name,
                require('os').networkInterfaces()['eth0'][0].address,
                (error) => {
                    if (error) {
                        logger.error("createVM Error -", error);
                        return res.status(statusCode.METHOD_FAILURE).json({
                            status: statusCode.METHOD_FAILURE,
                            message: "Error Adding VM Data To Redis",
                        });
                    }
                    else {
                        shell.exec(`/root/configuration/create-vm.sh ${data.name} ${data.ram} ${data.cpu} ${data.disk}`)

                        exec(`virsh list | grep ${data.name} | awk \'{print $3}\'`, (err, status, stderr) => {
                            if (err) {
                                logger.error("createVM -", req.body.name, error)
                                console.log("createVM -", req.body.name, error)
                            }
                            if (stderr) {
                                logger.error("createVM -", req.body.name, stderr)
                                console.log("createVM -", req.body.name, stderr)
                            }
                            if (status) {
                                data.status = status.trim()
                                data.ip = "unassigned"

                                var ipAPI = `curl -X POST -d '{"name" :"${data.name}"}' -H "Content-Type: application/json" ${config.api.IP} \n`

                                fs.appendFileSync('/var/spool/cron/root', "*/1 * * * * " + ipAPI)

                                this.VM.create(data)
                                    .then((vm) => {
                                        logger.info("createVM -", req.body.name, vm)
                                        console.log("createVM -", req.body.name, vm)

                                        return res.status(statusCode.CREATED).json({
                                            message: "Create OK - Virtual Machine Loading...",
                                        });
                                    })
                                    .catch((DBerror) => {
                                        logger.error("createVM Error -", DBerror);
                                        return res.status(statusCode.METHOD_FAILURE).json({
                                            status: statusCode.METHOD_FAILURE,
                                            message: "Error Adding VM Data To Postgres",
                                        });

                                    });
                            }
                        });

                    }

                })


        } catch (error) {
            logger.error("createVM -", req.body.name, vm)
            console.log("createVM -", req.body.name, vm)
            return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
                status: statusCode.INTERNAL_SERVER_ERROR,
                message: "Server Error",
            });
        }
    }

    async checkVMIP(req, res) {

        try {
            let data = {
                name: req.body.name,
            };

            exec(`arp -a | grep $(virsh domiflist ${data.name} | awk '{print $5 }' | tail -2 | head -1) | awk '{print $2}' | sed 's/[()]//g'`, (err, ip, stderr) => {
                if (err) {
                    logger.info("checkVMIP -", req.body.name, error)
                    console.log("checkVMIP -", req.body.name, error)
                }
                if (stderr) {
                    logger.info("checkVMIP -", req.body.name, stderr)
                    console.log("checkVMIP -", req.body.name, stderr)
                }
                if (ip == "") {
                    // data.ip = "unassigned"
                    // IP Unassigned
                    logger.info("checkVMIP -", req.body.name, "IP Unassigned")
                    console.log("checkVMIP -", req.body.name, "IP Unassigned")

                    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
                        status: statusCode.INTERNAL_SERVER_ERROR,
                        message: "Server Error",
                    });

                } else {
                    data.ip = ip
                    this.VM.update(data, {
                        where: {
                            name: req.body.name
                        },
                        limit: 1,
                    })
                        .then((vm) => {
                            var ipAPI = `curl -X POST -d '{"name" :"${data.name}"}' -H "Content-Type: application/json" ${config.api.IP} \n`

                            fs.readFile('/var/spool/cron/root', 'utf8', function (errorRead, line) {
                                if (errorRead) {
                                    logger.error("checkVMIP Error -", data.name, errorRead);
                                    return res.status(statusCode.METHOD_FAILURE).json({
                                        status: statusCode.METHOD_FAILURE,
                                        message: "Error Updating VM IP",
                                    });
                                } else {
                                    var result = line.replace("*/1 * * * * " + ipAPI, '')
                                    fs.writeFile('/var/spool/cron/root', result, 'utf8', function (errorWrite) {
                                        if (errorWrite) {
                                            logger.error("checkVMIP Error -", data.name, errorWrite);
                                            return res.status(statusCode.METHOD_FAILURE).json({
                                                status: statusCode.METHOD_FAILURE,
                                                message: "Error Updating VM IP",
                                            });

                                        }
                                        else {
                                            return res.status(statusCode.OK).json({
                                                message: "Virtual Machine IP Updated",
                                            });
                                        }
                                    });
                                }
                            })
                        })
                        .catch((DBerror) => {
                            logger.error("createVM Error -", data.name, DBerror);
                            return res.status(statusCode.METHOD_FAILURE).json({
                                status: statusCode.METHOD_FAILURE,
                                message: "Error Updating VM IP",
                            });
                        });
                }

            })

        } catch (error) {
            logger.error("createVM Error -", error);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
                status: statusCode.INTERNAL_SERVER_ERROR,
                message: "Server Error",
            });
        }

    }


})();
