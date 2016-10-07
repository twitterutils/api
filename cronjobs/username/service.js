var promise = require("the-promise-factory");
var rfr = require("rfr");
var dbConnectionFactory = rfr("lib/factories/dbConnection");
var usernameDataServiceFn = rfr("username/lib/dal/usernameDataService");

var userIdsReader = rfr("username/lib/services/userIdsReader")(
    rfr("lib/dal/graphDataService")(),
    rfr("username/lib/dal/changesDataService")(),
    rfr("username/lib/helpers/userIdHelper")()
);
var userIdBatchBuilder = rfr("username/lib/services/userIdBatchBuilder")(
    dbConnectionFactory,
    usernameDataServiceFn,
    rfr("lib/dal/registeredUsersDataService")(),
    userIdsReader,
    rfr("username/lib/helpers/userIdHelper")()
);

var usernameReader = rfr("username/lib/services/usernameReader")(
    userIdBatchBuilder,
    rfr("username/lib/dal/twitterUsersDataService")()
);

var usernameCrawlerService = rfr("username/lib/services/usernameCrawlerService")(
    dbConnectionFactory,
    usernameDataServiceFn,
    usernameReader
);

module.exports = {
    run: function(){
        return promise.create((fulfill, reject) => {
            console.log("[USERNAMECRAWLER] crawling...");

            usernameCrawlerService
                .run()
                .then(() => {
                    console.log("[USERNAMECRAWLER] crawling complete");
                    fulfill();
                }, (err) => {
                    console.error(err);
                    reject(err);
                });
        });
    }
}