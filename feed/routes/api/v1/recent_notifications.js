var rfr = require("rfr");
var router = require("express").Router();
var userNotifications = rfr("feed/lib/controllers/userNotifications");

router.get("/:twitter_user_id/:max_result_count?", (req, res, next) => {
    userNotifications().recent(
        req.params.twitter_user_id,
        req.params.max_result_count || 100,
        "the api key",
        res
    );
});

module.exports = router;
