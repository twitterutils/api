var rfr = require("rfr");
var router = require("express").Router();
var dbConnectionFactory = rfr("lib/webApiMongoDbConnectionFactory");
var twitterUserDataService = rfr("graph/lib/dal/twitterUserDataService");
var apiKey = rfr("lib/simpleApiKeyValidation");
var webError = rfr("lib/webApiError");
var twitterUser = rfr("graph/lib/controllers/twitterUser");

router.get("/:user_id/", (req, res, next) => {
    twitterUser(dbConnectionFactory, twitterUserDataService, apiKey, webError)
        .details(req.params.user_id, req.headers.authorization, res);
});

module.exports = router;