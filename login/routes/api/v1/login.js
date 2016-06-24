var rfr = require("rfr");
var router = require("express").Router();
var oauthFactory = rfr("login/lib/factories/oauth");
var dbConnection3 = require("web-api-mongodb-connection-factory");
var webError = rfr("lib/webApiError");
var authRequestsDataService2 = rfr("login/lib/dal/authRequestsDataService2");
var authRequestStarter = rfr("login/lib/controllers/authRequestStarter");

router.get("/", (req, res, next) => {
    authRequestStarter(
        dbConnection3, authRequestsDataService2, oauthFactory, webError
    ).process(
        req.query.callback, res
    );
});

module.exports = router;
