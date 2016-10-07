var rfr = require("rfr");
var promise = require("the-promise-factory");
var singleUserProcessorFactory = rfr("autounfollow/lib/factories/singleUserProcessor")(
    rfr("autounfollow/lib/services/singleUserProcessor"),

    rfr("autounfollow/lib/dal/userCredentialsDataService"),
    rfr("autounfollow/lib/services/userChangesService"),
    rfr("autounfollow/lib/services/unfollowActionsBuilder"),
    rfr("autounfollow/lib/services/twitterFollowersService"),
    rfr("autounfollow/lib/dal/notificationsDataService"),

    rfr("autounfollow/lib/dal/userStatusDataService"),
    rfr("lib/dal/graphDataService"),

    rfr("lib/dal/registeredUsersDataService")
);

var autounfollow = rfr("autounfollow/lib/services/autounfollow")(
    rfr("lib/factories/dbConnection"),
    rfr("lib/dal/registeredUsersDataService")(),
    singleUserProcessorFactory
);

module.exports = {
    run: function () {
        return promise.create((fulfill, reject) => {
            console.log("[AUTOUNFOLLOW] Autounfollow started");

            autounfollow
                .run()
                .then(() => {
                    console.log("[AUTOUNFOLLOW] Autounfollow Completed");
                    fulfill();
                }, (err) => {
                    console.error(err);
                    reject(err);
                });
        })
    }
}
