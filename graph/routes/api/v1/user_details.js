var rfr = require("rfr");
var router = require("express").Router();
var dbConnectionFactory = require("web-api-mongodb-connection-factory");
var twitterUserDataService = rfr("graph/lib/dal/twitterUserDataService");
var apiKey = rfr("lib/simpleApiKeyValidation");
var webError = require("web-api-error");
var twitterUser = rfr("graph/lib/controllers/twitterUser");

router.get("/:user_id/", (req, res, next) => {
    twitterUser(dbConnectionFactory, twitterUserDataService, apiKey, webError)
        .details(req.params.user_id, req.headers.authorization, res);
});

module.exports = router;