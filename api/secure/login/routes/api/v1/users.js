var rfr = require("rfr");
var webError = rfr("lib/webApiError");
var router = require("express").Router();
var dbConnectionFactory = rfr("lib/webApiMongoDbConnectionFactory");
var apiKey = rfr("lib/simpleApiKeyValidation");
var appUsersDataService = rfr("secure/login/lib/dal/appUsersDataService");
var users = rfr("secure/login/lib/controllers/users");

router.get("/", (req, res, next) => {
    users(dbConnectionFactory, appUsersDataService, apiKey, webError)
        .all(req.headers.authorization, res);
});

module.exports = router;
