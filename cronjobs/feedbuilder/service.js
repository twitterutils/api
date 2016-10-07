var rfr = require("rfr");
var promise = require("the-promise-factory");
var userFeedServiceFactory = rfr("feedbuilder/lib/factories/userFeedService")(
    rfr("feedbuilder/lib/services/userFeedService"),
    rfr("feedbuilder/lib/dal/notificationsDataService")(),
    rfr("feedbuilder/lib/dal/usernamesDataService")(),
    rfr("feedbuilder/lib/helpers/userIdHelper")(),
    rfr("feedbuilder/lib/helpers/notificationsTransformer")(),
    rfr("feedbuilder/lib/dal/feedDataService")
);
var feedBuilder = rfr("feedbuilder/lib/services/feedbuilder")(
    rfr("lib/dal/registeredUsersDataService")(),
    rfr("lib/factories/dbConnection"),
    userFeedServiceFactory
);

module.exports = {
    run: function () {
        return promise.create((fulfill, reject) => {
            console.log("[USERFEEDBUILDER] FeedBuilder Started");

            feedBuilder
                .build()
                .then(() => {
                    console.log("[USERFEEDBUILDER] FeedBuilder Completed");
                    fulfill()
                }, (err) => {
                    console.error(err);
                    reject(err);
                })
        })
    }
}
