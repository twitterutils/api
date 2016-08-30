var rfr = require("rfr");
var webError = rfr("lib/webApiError");
var router = require("express").Router();
var dbConnectionFactory = rfr("lib/webApiMongoDbConnectionFactory");
var apiKey = rfr("lib/simpleApiKeyValidation");
var scheduleListController = rfr("secure/schedule/lib/controllers/scheduleList");
var scheduleListDataService = rfr("secure/schedule/lib/dal/scheduleListDataService");

router.get("/", (req, res, next) => {
    scheduleListController(dbConnectionFactory, scheduleListDataService, apiKey, webError)
        .all(req.headers.authorization, res);
});

module.exports = router;
