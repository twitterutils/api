var rfr = require("rfr");
var webError = rfr("lib/webApiError");
var router = require("express").Router();
var dbConnectionFactory = rfr("lib/webApiMongoDbConnectionFactory");
var apiKey = rfr("lib/simpleApiKeyValidation");

router.get("/", (req, res, next) => {
    res.send([
        "111111",
        "222222"
    ]);
});

module.exports = router;
