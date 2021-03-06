var rfr = require("rfr");
var router = require("express").Router();
var dbConnectionFactory = rfr("lib/webApiMongoDbConnectionFactory");
var twitterChangesDataService = rfr("secure/graph/lib/dal/twitterChangesDataService");
var twitterGraphDataService = rfr("secure/graph/lib/dal/twitterGraphDataService");
var apiKey = rfr("lib/simpleApiKeyValidation");
var webError = rfr("lib/webApiError");
var twitterChanges = rfr("secure/graph/lib/controllers/twitterChanges");

router.get("/:user_id/", (req, res, next) => {
    twitterChanges(dbConnectionFactory, twitterChangesDataService, twitterGraphDataService, apiKey, webError)
        .list(req.params.user_id, req.headers.authorization, res);
});

module.exports = router;