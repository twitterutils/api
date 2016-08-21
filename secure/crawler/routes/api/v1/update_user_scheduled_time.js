var rfr = require("rfr");
var webError = rfr("lib/webApiError");
var router = require("express").Router();
var dbConnectionFactory = rfr("lib/webApiMongoDbConnectionFactory");
var apiKey = rfr("lib/simpleApiKeyValidation");
// var appUsersDataService = rfr("secure/login/lib/dal/appUsersDataService");
// var users = rfr("secure/login/lib/controllers/users");

router.post("/", (req, res) => {
    // users(dbConnectionFactory, appUsersDataService, apiKey, webError)
    //     .disable(req.body.userid, req.headers.authorization, res);
    res.send({success: true });
});

module.exports = router;
