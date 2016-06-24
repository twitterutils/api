var rfr = require("rfr");
var router = require("express").Router();
var oauthFactory = rfr("lib/factories/oauth");
var dbConnection3 = require("web-api-mongodb-connection-factory");
var webError = require("web-api-error");
var authRequestsDataService2 = rfr("lib/dal/authRequestsDataService2");
var authRequestStarter = rfr("lib/controllers/authRequestStarter");

router.get("/", (req, res, next) => {
    authRequestStarter(
        dbConnection3, authRequestsDataService2, oauthFactory, webError
    ).process(
        req.query.callback, res
    );
});

module.exports = router;
