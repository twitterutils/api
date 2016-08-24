var rfr = require("rfr");
var webError = rfr("lib/webApiError");
var router = require("express").Router();
var dbConnectionFactory = rfr("lib/webApiMongoDbConnectionFactory");
var apiKey = rfr("lib/simpleApiKeyValidation");
var userScheduleController2 = rfr("secure/schedule/lib/controllers/userSchedule2");
var userScheduleDataServiceFactory = rfr("secure/schedule/lib/factories/userScheduleServiceFactory")();

router.post("/", (req, res) => {
    userScheduleController2(dbConnectionFactory, userScheduleDataServiceFactory, apiKey, webError)
        .update(req.body.userid, req.headers.authorization, res);
});

module.exports = router;
