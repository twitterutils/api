var router = require("express").Router();
var rfr = require("rfr");
var cache = rfr("lib/theApiCache");
var dbConnectionFactory = rfr("lib/webApiMongoDbConnectionFactory");
var cors = require('cors');

router.get("/", cors(), cache.longLived(), (req, res, next) => {
    dbConnectionFactory(res, "LOGIN_DB_CONNECTION_STRING").then((db) => {
        console.log("status ok");
        res.send({status: "ok"});
    });
});

module.exports = router;
