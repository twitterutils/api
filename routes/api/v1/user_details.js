var rfr = require("rfr");
var webError = require("web-api-error");
var router = require("express").Router();
var dbConnection3 = require("web-api-mongodb-connection-factory");
var apiKey = require("simple-api-key-validation");
var appUsersDataService = rfr("lib/dal/appUsersDataService");
var users = rfr("lib/controllers/users");

router.get("/:twitter_user_id/", (req, res, next) => {
    users(dbConnection3, appUsersDataService, apiKey, webError)
        .details(req.params.twitter_user_id, req.headers.authorization, res);
});

module.exports = router;
