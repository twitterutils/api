var rfr = require("rfr");
var router = require("express").Router();
var dbConnectionFactory = require("web-api-mongodb-connection-factory");
var twitterChangesDataService = rfr("lib/dal/twitterChangesDataService");
var twitterGraphDataService = rfr("lib/dal/twitterGraphDataService");
var apiKey = require("simple-api-key-validation");
var webError = require("web-api-error");
var twitterChanges = rfr("lib/controllers/twitterChanges");

router.get("/:graph_id/", (req, res, next) => {
    twitterChanges(dbConnectionFactory, twitterChangesDataService, twitterGraphDataService, apiKey, webError)
        .changesForUserCreatedAfter(req.params.graph_id, req.headers.authorization, res);
});

module.exports = router;