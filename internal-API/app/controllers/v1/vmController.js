const Sequelize = require("sequelize");
const statusCode = require("http-status-codes");
const log4js = require("log4js");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const shell = require('shelljs')

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
                data.name, require('os').networkInterfaces()[eth0][0].address,
                (error) => {
                    if (error) {
                        logger.error("createVM Error -", error);
                        return res.status(statusCode.METHOD_FAILURE).json({
                            status: statusCode.METHOD_FAILURE,
                            message: "Error Adding VM Data To Redis",
                        });
                    }
                    else {
                        shell.exec('/root/configuration/createVM.sh')

                        var vmAPI = `curl -X POST -d '{"name" :"${data.name}"}' -H "Content-Type: application/json" ${config.api.VM} \n`
                        var ipAPI = `curl -X POST -d '{"name" :"${data.name}"}' -H "Content-Type: application/json" ${config.api.IP} \n`

                        fs.appendFileSync('/var/spool/cron/root', "*/3 * * * * " + vmAPI)
                        fs.appendFileSync('/var/spool/cron/root', "*/3 * * * * " + ipAPI)

                        this.VM.create(data)
                            .then((vm) => {
                                logger.info("createVM -", vm)
                                console.log("createVM -", vm)

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

                })


        } catch (error) {
            logger.error("createVM Error -", error);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
                status: statusCode.INTERNAL_SERVER_ERROR,
                message: "Server Error",
            });
        }
    }

    async checkVMStatus(req, res) {

        try {
            let data = {
                status: ""
            };

            shell.exec('/root/configuration/createVM.sh')

            var vmAPI = `curl -X POST -d '{"name" :"${data.name}"}' -H "Content-Type: application/json" ${config.api.VM} \n`
            var ipAPI = `curl -X POST -d '{"name" :"${data.name}"}' -H "Content-Type: application/json" ${config.api.IP} \n`

            fs.appendFileSync('/var/spool/cron/root', "*/3 * * * * " + vmAPI)
            fs.appendFileSync('/var/spool/cron/root', "*/3 * * * * " + ipAPI)

                .update(data, {
                    where: {
                        name:  req.body.name
                    },
                    limit: 1,
                })
                .then((vm) => {
                    var ipAPI = `curl -X POST -d '{"name" :"${data.name}"}' -H "Content-Type: application/json" ${config.api.IP} \n`




                    console.log(timeline);
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



        } catch (error) {
            logger.error("createVM Error -", error);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
                status: statusCode.INTERNAL_SERVER_ERROR,
                message: "Server Error",
            });
        }

    }

    async checkVMIP(req, res) {


    }

    // Methodes

    async update(query, userId) {
        console.log(query);

        return new Promise((res, rej) => {
            let name = req.body.name

            let data = {
                ip: ""
            };

            this.VM.update(data, {
                where: {
                    name: data.name
                },
                limit: 1,
            })
                .then((vm) => {
                    var ipAPI = `curl -X POST -d '{"name" :"${data.name}"}' -H "Content-Type: application/json" ${config.api.IP} \n`



                })
                .catch((error) => {
                    rej(error);
                });
        });
    }



})();
