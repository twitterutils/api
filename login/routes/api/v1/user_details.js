var rfr = require("rfr");
var webError = rfr("lib/webApiError");
var router = require("express").Router();
var dbConnection3 = require("web-api-mongodb-connection-factory");
var apiKey = rfr("lib/simpleApiKeyValidation");
var appUsersDataService = rfr("login/lib/dal/appUsersDataService");
var users = rfr("login/lib/controllers/users");

router.get("/:twitter_user_id/", (req, res, next) => {
    users(dbConnection3, appUsersDataService, apiKey, webError)
        .details(req.params.twitter_user_id, req.headers.authorization, res);
});

module.exports = router;
