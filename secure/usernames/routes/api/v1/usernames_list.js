var rfr = require("rfr");
var router = require("express").Router();
var dbConnectionFactory = rfr("lib/webApiMongoDbConnectionFactory");
var apiKey = rfr("lib/simpleApiKeyValidation");
var webError = rfr("lib/webApiError");
var usernames = rfr("secure/usernames/lib/controllers/usernames");
var usernamesDataService = rfr("secure/usernames/lib/dal/usernamesDataService");

router.get("/:userIdsStr/", (req, res, next) => {
    usernames(
        dbConnectionFactory,
        usernamesDataService,
        apiKey,
        webError
    ).find(
        req.params.userIdsStr,
        req.headers.authorization,
        res
    );
});

module.exports = router;