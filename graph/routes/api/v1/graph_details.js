var rfr = require("rfr");
var router = require("express").Router();
var dbConnectionFactory = require("web-api-mongodb-connection-factory");
var twitterGraphDataService = rfr("lib/dal/twitterGraphDataService");
var apiKey = require("simple-api-key-validation");
var webError = require("web-api-error");
var twitterGraph = rfr("lib/controllers/twitterGraph");

router.get("/:graph_id/", (req, res, next) => {
    twitterGraph(dbConnectionFactory, twitterGraphDataService, apiKey, webError)
        .details(req.params.graph_id, req.headers.authorization, res);
});

module.exports = router;