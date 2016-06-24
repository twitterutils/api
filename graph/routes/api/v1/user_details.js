var rfr = require("rfr");
var router = require("express").Router();
var dbConnectionFactory = require("web-api-mongodb-connection-factory");
var twitterUserDataService = rfr("lib/dal/twitterUserDataService");
var apiKey = require("simple-api-key-validation");
var webError = require("web-api-error");
var twitterUser = rfr("lib/controllers/twitterUser");

router.get("/:user_id/", (req, res, next) => {
    twitterUser(dbConnectionFactory, twitterUserDataService, apiKey, webError)
        .details(req.params.user_id, req.headers.authorization, res);
});

module.exports = router;