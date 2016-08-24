var rfr = require("rfr");
var webError = rfr("lib/webApiError");
var router = require("express").Router();
var dbConnectionFactory = rfr("lib/webApiMongoDbConnectionFactory");
var apiKey = rfr("lib/simpleApiKeyValidation");
var userScheduleDataService = rfr("secure/schedule/lib/dal/userScheduleDataService");
var userScheduleController = rfr("secure/schedule/lib/controllers/userSchedule");
var userScheduleService = rfr("secure/schedule/lib/services/userSchedule");

router.post("/", (req, res) => {
    userScheduleController(dbConnectionFactory, userScheduleDataService, userScheduleService, apiKey, webError)
        .update(req.body.userid, req.headers.authorization, res);
});

module.exports = router;
