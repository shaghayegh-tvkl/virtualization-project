var redis = require("redis");
var client = redis.createClient(config.redis.port, config.redis.host);
var log4js = require("log4js")
var logger = log4js.getLogger("database")

module.exports = class RedisDB {

    async connectToDatabase() {

        client.on('connect', function () {
            logger.info("Connected to Redis")
        }).on('error', function (error) {
            logger.error("Redis Disconnected");
        });
    }


    add(index, key, value, callback) {
        client.select(index, add => {
            client.hmset(key, value, (error) => { return callback(error) });
        })
    }

    get(index, key, callback) {
        client.select(index, get => {
            client.hgetall(key, function (error, results) {
                if (error) {
                    callback(error)
                } else {
                    callback(results)
                }
            })
        })
    }

    getKeys(index, callback) {
        client.select(index, get => {
            client.keys('*', (error, results) => {
                if (error) {
                    callback(error)
                }
                else {
                    callback(results)
                }
            })
        })
    }

    update(index, key, value, callback) {
        client.select(index, get => {
            client.hmset(key, value, (error) => {
                return callback(error)
            });
        })
    }

    delete(index, key, callback) {
        client.select(index, (errSelect, res) => {
            client.keys('*', (errKey, results) => {
                client.del(key, error => {
                    callback(error)
                })
            })
        })
    }

}
