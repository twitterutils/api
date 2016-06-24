var rfr = require("rfr");
var router = require("express").Router();
var dbConnectionFactory = rfr("lib/webApiMongoDbConnectionFactory");
var apiKey = rfr("lib/simpleApiKeyValidation");
var webError = rfr("lib/webApiError");
var notificationsDataService = rfr("notifications/lib/dal/notificationsDataService");
var notifications = rfr("notifications/lib/controllers/notifications");

router.post("/", (req, res) => {

    notifications(dbConnectionFactory, notificationsDataService, apiKey, webError)
        .send(req.body, req.headers, res);
});

module.exports = router;
