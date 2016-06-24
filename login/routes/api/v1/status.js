var router = require("express").Router();
var cache = require("the-api-cache");
var dbConnection3 = require("web-api-mongodb-connection-factory");

router.get("/", cache.longLived(), (req, res, next) => {
    dbConnection3(res, "LOGIN_DB_CONNECTION_STRING").then((db) => {
        console.log("status ok");
        res.send({status: "ok"});
    });
});

module.exports = router;
