var rfr = require("rfr");
var router = require("express").Router();
var dbConnectionFactory = require("web-api-mongodb-connection-factory");
var twitterChangesDataService = rfr("graph/lib/dal/twitterChangesDataService");
var twitterGraphDataService = rfr("graph/lib/dal/twitterGraphDataService");
var apiKey = rfr("lib/simpleApiKeyValidation");
var webError = rfr("lib/webApiError");
var twitterChanges = rfr("graph/lib/controllers/twitterChanges");

router.get("/:graph_id/", (req, res, next) => {
    twitterChanges(dbConnectionFactory, twitterChangesDataService, twitterGraphDataService, apiKey, webError)
        .changesForUserCreatedAfter(req.params.graph_id, req.headers.authorization, res);
});

module.exports = router;