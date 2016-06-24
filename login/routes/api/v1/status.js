var router = require("express").Router();
var rfr = require("rfr");
var cache = rfr("lib/theApiCache");
var dbConnection3 = require("web-api-mongodb-connection-factory");

router.get("/", cache.longLived(), (req, res, next) => {
    dbConnection3(res, "LOGIN_DB_CONNECTION_STRING").then((db) => {
        console.log("status ok");
        res.send({status: "ok"});
    });
});

module.exports = router;
