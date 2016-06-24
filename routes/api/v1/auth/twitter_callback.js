var rfr = require("rfr");
var router = require("express").Router();
var oauth = rfr("lib/factories/oauth");
var dbConnection3 = require("web-api-mongodb-connection-factory");
var webError = require("web-api-error");
var cache = require("the-api-cache");
var authRequestsDataService2 = rfr("lib/dal/authRequestsDataService2");
var appUsersDataService = rfr("lib/dal/appUsersDataService");
var authRequestCompletion = rfr("lib/controllers/authRequestCompletion");
var oauthAccessToken = rfr("lib/controllers/oauthAccessToken");

router.get("/:authRequestId/", cache.longLived(), (req, res, next) => {
    var tokenHandler = oauthAccessToken(appUsersDataService);
    authRequestCompletion(
        oauth, dbConnection3, authRequestsDataService2,
        webError, tokenHandler
    ).process(
        req.params.authRequestId, req.query.oauth_verifier, res
    );
});

module.exports = router;
