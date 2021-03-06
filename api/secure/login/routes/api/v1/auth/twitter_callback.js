var rfr = require("rfr");
var router = require("express").Router();
var oauth = rfr("secure/login/lib/factories/oauth");
var dbConnectionFactory = rfr("lib/webApiMongoDbConnectionFactory");
var webError = rfr("lib/webApiError");
var cache = rfr("lib/theApiCache");
var authRequestsDataService2 = rfr("secure/login/lib/dal/authRequestsDataService2");
var appUsersDataService = rfr("secure/login/lib/dal/appUsersDataService");
var authRequestCompletion = rfr("secure/login/lib/controllers/authRequestCompletion");
var oauthAccessToken = rfr("secure/login/lib/controllers/oauthAccessToken");

router.get("/:authRequestId/", cache.longLived(), (req, res, next) => {
    var tokenHandler = oauthAccessToken(appUsersDataService);
    authRequestCompletion(
        oauth, dbConnectionFactory, authRequestsDataService2,
        webError, tokenHandler
    ).process(
        req.params.authRequestId, req.query.oauth_verifier, res
    );
});

module.exports = router;
