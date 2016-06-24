var rfr = require("rfr");
var router = require("express").Router();
var dbConnection = require("web-api-mongodb-connection-factory");
var apiKey = require("simple-api-key-validation");
var webError = require("web-api-error");
var notificationsDataService = rfr("notifications/lib/dal/notificationsDataService");
var notifications = rfr("notifications/lib/controllers/notifications");

router.post("/", (req, res) => {

    notifications(dbConnection, notificationsDataService, apiKey, webError)
        .send(req.body, req.headers, res);
});

module.exports = router;
