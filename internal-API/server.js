const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const log4js = require('log4js')
global.config = require("./app/config");

const routeHandler = require('./app/routes/index');

const mongoDatabase = require(`${config.path.database}/MicrohostingDB`);
const mongoDatabaseObj = new mongoDatabase();
mongoDatabaseObj.connectToDatabase();


const redisDatabase = require(`${config.path.database}/CacheDB`);
const redisDatabaseObj = new redisDatabase();
redisDatabaseObj.connectToDatabase();

log4js.configure({
    appenders: {
        microhostingFile: { type: 'file', filename: 'microhosting.log' },
        dnsFile: { type: 'file', filename: 'dns.log' },
        vmFile: { type: 'file', filename: 'vm.log' },
        aiFile: { type: 'file', filename: 'ai.log' },
        default: { type: 'file', filename: 'toomix.log' }
    },
    categories: {
        microhosting: { appenders: ['microhostingFile'], level: 'info' },
        dns: { appenders: ['dnsFile'], level: 'info' },
        vm: { appenders: ['vmFile'], level: 'info' },
        ai: { appenders: ['aiFile'], level: 'info' },
        default: { appenders: ['default'], level: 'info' }     
    }
});

var logger = log4js.getLogger();
app.use(log4js.connectLogger(logger, { level: 'info' }));


app.use(cors());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept,x-access-token", "Authorization", "X-Requested-With"
    );

    res.header("Access-Control-Allow-Credentials", "true");
    next();
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api", routeHandler);

app.all("*", (req, res) => {
    return res.status(404).json({
        success: false,
        msg: "404 Error - Not Found"
    });
});



// if ((process.env.NODE_ENV) !== 'production') {
//     app.use(logger('dev'));
// }



app.listen(config.port, config.ip, () => {
    logger.info(`Server is running on ${config.ip}:${config.port}`)
    
})
