const Sequelize = require("sequelize");
const statusCode = require("http-status-codes");
const log4js = require("log4js");
const path = require("path");
const fs = require("fs");
const json2excel = require("node-json-xlsx");
const axios = require("axios");

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

            const redisDatabase = require(`${config.path.models}/redis`);
            const redisDatabaseObj = new redisDatabase();

            redisDatabaseObj.add(data.name,)

            this.VM.create(data)
                .then((timeline) => {
                    console.log(timeline);
                    return res.status(statusCode.CREATED).json({
                        message: "Create OK - Virtual Machine Loading...",
                    });
                })
                .catch((error) => {
                    logger.error("createVM Error -", error);
                    return res.status(statusCode.METHOD_FAILURE).json({
                        status: statusCode.METHOD_FAILURE,
                        message: "Error Adding VM Data To Database",
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



    // Methodes

    async create(query, userId) {
        return new Promise((res, rej) => {
            this.setDay(query.date, (error, calendar) => {
                if (error) {
                    rej(error);
                }

                console.log(calendar);

                if (calendar) {
                    let timelineData = {
                        date: moment(query.date, "jYYYY-jMM-jDD").format("YYYY-MM-DD"),
                        pdate: query.date,
                        day: calendar.day,
                        entrance_time: query.entrance,
                        exit_time: query.exit,
                        efficient_time: query.efficient,
                        home_time: query.home,
                        force_time: query.home,
                        leave_time: query.leave,
                        overtime: query.overtime,
                        daily_task: query.task,
                        employeeId: userId,
                    };

                    this.Timeline.create(timelineData)
                        .then((timeline) => {
                            res(timeline);
                        })
                        .catch((error) => {
                            rej(error);
                        });
                }
            });
        });
    }

    async update(query, userId) {
        console.log(query);

        return new Promise((res, rej) => {
            let timelineData = {
                entrance_time: query.entrance,
                exit_time: query.exit,
                efficient_time: query.efficient,
                home_time: query.home,
                force_time: query.home,
                leave_time: query.leave,
                overtime: query.overtime,
                daily_task: query.task,
            };

            this.Timeline.update(timelineData, {
                where: {
                    employeeId: userId,
                    date: moment(query.date, "jYYYY-jMM-jDD").format("YYYY-MM-DD"),
                },
                limit: 1,
            })
                .then((timeline) => {
                    res(timeline);
                })
                .catch((error) => {
                    rej(error);
                });
        });
    }



})();
