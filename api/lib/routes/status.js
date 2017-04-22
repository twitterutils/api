var router = require("express").Router();
var rfr = require("rfr");
var cache = rfr("lib/theApiCache");
var dbConnectionFactory = rfr("lib/webApiMongoDbConnectionFactory");
var cors = require('cors');
var webError = rfr("lib/webApiError");

module.exports = function (dbConnectionName) {
    router.get("/", cors(), cache.longLived(), (req, res, next) => {
        dbConnectionFactory(res, dbConnectionName).then((db) => {
            db.collection("db_status").findOne((err, result) => {
                if (err) {
                    webError.unexpected(res, "Db Connection Failed", err);
                    return;
                }

                if (!result){
                    webError.unexpected(res, "Error Reading DB Status");
                    return;
                }

                console.log("status ok");
                res.send({status: "ok"});
            })
        });
    });

    return router;
};
