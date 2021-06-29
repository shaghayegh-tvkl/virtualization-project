const Sequelize = require("sequelize");
const statusCode = require("http-status-codes");
const log4js = require("log4js");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const shell = require('shelljs')
const promise = require('promise');

const op = Sequelize.Op;

const logger = log4js.getLogger("vm");

const controller = require(`${config.path.controllers}/controller`);


module.exports = new (class vmController extends controller {
    constructor() {
        super();
        this.VM = this.models.VM;

    }

    // APIs

    async listVM(req, res) {
        await this.list().then((machines) => {

            return res.status(statusCode.OK).json(machines);

        }).catch((error) => {
            logger.error("listVM -", error);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
                status: statusCode.INTERNAL_SERVER_ERROR,
                message: "Server Error",
            });
        })

    }

    async createVM(req, res) {

        try {
            let body = {
                name: req.body.name,
                ram: req.body.ram,
                cpu: req.body.cpu,
                disk: req.body.disk
            };

            let request = {
                method: 'post',
                url: config.api.create,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: body
            }

            await axios(request)
                .then(async (response) => {

                    logger.info("createVM -", vm)
                    console.log("createVM -", vm)

                    return res.status(statusCode.CREATED).json({
                        message: "Create OK - Virtual Machine Loading...",
                    });

                })
                .catch(error => {
                    logger.error("createVM API Error -", error.response.data);
                    return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
                        status: statusCode.INTERNAL_SERVER_ERROR,
                        message: "Server Error",
                    });

                })


        } catch (error) {
            logger.error("createVM Error -", error);
            return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
                status: statusCode.INTERNAL_SERVER_ERROR,
                message: "Server Error",
            });
        }
    }

    // async checkVMStatus(req, res) {

    //     try {
    //         let data = {
    //             status: ""
    //         };

    //         shell.exec('/root/configuration/create-vm.sh')

    //         var vmAPI = `curl -X POST -d '{"name" :"${data.name}"}' -H "Content-Type: application/json" ${config.api.VM} \n`
    //         var ipAPI = `curl -X POST -d '{"name" :"${data.name}"}' -H "Content-Type: application/json" ${config.api.IP} \n`

    //         fs.appendFileSync('/var/spool/cron/root', "*/3 * * * * " + vmAPI)
    //         fs.appendFileSync('/var/spool/cron/root', "*/3 * * * * " + ipAPI)

    //             .update(data, {
    //                 where: {
    //                     name: req.body.name
    //                 },
    //                 limit: 1,
    //             })
    //             .then((vm) => {
    //                 var ipAPI = `curl -X POST -d '{"name" :"${data.name}"}' -H "Content-Type: application/json" ${config.api.IP} \n`




    //                 console.log(timeline);
    //                 return res.status(statusCode.CREATED).json({
    //                     message: "Create OK - Virtual Machine Loading...",
    //                 });
    //             })
    //             .catch((DBerror) => {
    //                 logger.error("createVM Error -", DBerror);
    //                 return res.status(statusCode.METHOD_FAILURE).json({
    //                     status: statusCode.METHOD_FAILURE,
    //                     message: "Error Adding VM Data To Postgres",
    //                 });
    //             });



    //     } catch (error) {
    //         logger.error("createVM Error -", error);
    //         return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
    //             status: statusCode.INTERNAL_SERVER_ERROR,
    //             message: "Server Error",
    //         });
    //     }

    // }

    // async checkVMIP(req, res) {


    // }

    // Methodes

    async list() {
        return new promise((res, rej) => {
            let machines = [];

            this.VM.findAll({})
                .then(result => {
                    if (result) {
                        for (let i = 0; i < result.length; i++) {
                            machines.push({
                                Name: result[i].dataValues.name,
                                RAM: result[i].dataValues.ram,
                                CPU: result[i].dataValues.cpu,
                                Disk: result[i].dataValues.disk,
                                IP: result[i].dataValues.ip,
                                CreatedAt: result[i].dataValues.createdAt
                            });
                            if (machines.length == result.length) {
                                res(machines)
                            }
                        }
                        if (machines.length == result.length) {
                            res(machines)
                        }
                    }
                })
                .catch(error => {
                    logger.error(error);
                    rej(error);
                });
        })
    }



})();
