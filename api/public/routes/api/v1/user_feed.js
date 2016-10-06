var rfr = require("rfr");
var router = require("express").Router();
var cors = require('cors');
var cache = rfr("lib/theApiCache");
var dbConnectionFactory = rfr("lib/webApiMongoDbConnectionFactory");
var webError = rfr("lib/webApiError");
var userFeed = rfr("public/lib/controllers/userFeed");
var userFeedDataService = rfr("public/lib/dal/userFeedDataService");

router.get("/:user_name", cors(), cache.longLived(), (req, res, next) => {
    userFeed(
        dbConnectionFactory,
        userFeedDataService,
        webError
    ).read(
        req.params.user_name,
        res
    );
});

module.exports = router;
