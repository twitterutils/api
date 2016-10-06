var rfr = require("rfr");
var router = require("express").Router();
var dbConnectionFactory = rfr("lib/webApiMongoDbConnectionFactory");
var twitterGraphDataService = rfr("secure/graph/lib/dal/twitterGraphDataService");
var apiKey = rfr("lib/simpleApiKeyValidation");
var webError = rfr("lib/webApiError");
var twitterGraph = rfr("secure/graph/lib/controllers/twitterGraph");

router.get("/:graph_id/", (req, res, next) => {
    twitterGraph(dbConnectionFactory, twitterGraphDataService, apiKey, webError)
        .details(req.params.graph_id, req.headers.authorization, res);
});

module.exports = router;