var rfr = require("rfr");
var router = require("express").Router();
var dbConnectionFactory = rfr("lib/webApiMongoDbConnectionFactory");
var apiKey = rfr("lib/simpleApiKeyValidation");
var webError = rfr("lib/webApiError");
var userNotifications = rfr("feed/lib/controllers/userNotifications");
var notificationsDataService = rfr("feed/lib/dal/notificationsDataService");

router.get("/:twitter_user_id/:max_result_count?", (req, res, next) => {
    userNotifications(
        dbConnectionFactory,
        notificationsDataService,
        apiKey,
        webError
    ).recent(
        req.params.twitter_user_id,
        req.params.max_result_count || 100,
        req.headers.authorization,
        res
    );
});

module.exports = router;
