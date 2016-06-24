var rfr = require("rfr");
var router = require("express").Router();
var dbConnectionFactory = require("web-api-mongodb-connection-factory");
var twitterChangesDataService = rfr("graph/lib/dal/twitterChangesDataService");
var twitterGraphDataService = rfr("graph/lib/dal/twitterGraphDataService");
var apiKey = require("simple-api-key-validation");
var webError = require("web-api-error");
var twitterChanges = rfr("graph/lib/controllers/twitterChanges");

router.get("/:user_id/", (req, res, next) => {
    twitterChanges(dbConnectionFactory, twitterChangesDataService, twitterGraphDataService, apiKey, webError)
        .list(req.params.user_id, req.headers.authorization, res);
});

module.exports = router;