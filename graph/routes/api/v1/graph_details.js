var rfr = require("rfr");
var router = require("express").Router();
var dbConnectionFactory = require("web-api-mongodb-connection-factory");
var twitterGraphDataService = rfr("graph/lib/dal/twitterGraphDataService");
var apiKey = rfr("lib/simpleApiKeyValidation");
var webError = require("web-api-error");
var twitterGraph = rfr("graph/lib/controllers/twitterGraph");

router.get("/:graph_id/", (req, res, next) => {
    twitterGraph(dbConnectionFactory, twitterGraphDataService, apiKey, webError)
        .details(req.params.graph_id, req.headers.authorization, res);
});

module.exports = router;