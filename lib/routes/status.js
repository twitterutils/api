var router = require("express").Router();
var rfr = require("rfr");
var cache = rfr("lib/theApiCache");
var dbConnectionFactory = rfr("lib/webApiMongoDbConnectionFactory");
var cors = require('cors');

module.exports = function (dbConnectionName) {
    router.get("/", cors(), cache.longLived(), (req, res, next) => {
        dbConnectionFactory(res, dbConnectionName).then((db) => {
            console.log("status ok");
            res.send({status: "ok"});
        });
    });

    return router;
};
