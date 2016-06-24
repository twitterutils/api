var rfr = require("rfr");
var webError = rfr("lib/webApiError");
var router = require("express").Router();
var dbConnectionFactory = rfr("lib/webApiMongoDbConnectionFactory");
var apiKey = rfr("lib/simpleApiKeyValidation");
var appUsersDataService = rfr("login/lib/dal/appUsersDataService");
var users = rfr("login/lib/controllers/users");

router.get("/:twitter_user_id/", (req, res, next) => {
    users(dbConnectionFactory, appUsersDataService, apiKey, webError)
        .details(req.params.twitter_user_id, req.headers.authorization, res);
});

module.exports = router;
