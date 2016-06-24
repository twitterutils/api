var rfr = require("rfr");
var router = require("express").Router();
var oauthFactory = rfr("login/lib/factories/oauth");
var dbConnectionFactory = rfr("lib/webApiMongoDbConnectionFactory");
var webError = rfr("lib/webApiError");
var authRequestsDataService2 = rfr("login/lib/dal/authRequestsDataService2");
var authRequestStarter = rfr("login/lib/controllers/authRequestStarter");

router.get("/", (req, res, next) => {
    authRequestStarter(
        dbConnectionFactory, authRequestsDataService2, oauthFactory, webError
    ).process(
        req.query.callback, res
    );
});

module.exports = router;
