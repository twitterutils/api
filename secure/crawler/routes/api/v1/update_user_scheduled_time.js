var rfr = require("rfr");
var webError = rfr("lib/webApiError");
var router = require("express").Router();
var dbConnectionFactory = rfr("lib/webApiMongoDbConnectionFactory");
var apiKey = rfr("lib/simpleApiKeyValidation");
var userScheduleDataService = rfr("secure/crawler/lib/dal/userScheduleDataService");
var userSchedule = rfr("secure/crawler/lib/controllers/userSchedule");

router.post("/", (req, res) => {
    userSchedule(dbConnectionFactory, userScheduleDataService, apiKey, webError)
        .update(req.body.userid, req.headers.authorization, res);
});

module.exports = router;
