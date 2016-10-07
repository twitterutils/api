var promise = require("the-promise-factory");
var _ = require("underscore");
var twitterNodeClientFactory = require("twitter-node-client-factory");
var throttleFactory = require("throttle-factory");
var rfr = require("rfr");
var userIdHelper = rfr("username/lib/helpers/userIdHelper")();

module.exports = function(twitterClient, twitterThrottleFactory){
    if (!twitterClient){
        twitterClient = twitterNodeClientFactory(
            null, null, null,
            "TWU_CRON_USERNAME_TWITTER_CONSUMER_KEY",
            "TWU_CRON_USERNAME_TWITTER_CONSUMER_SECRET"
        );
    }

    if (!twitterThrottleFactory){
        twitterThrottleFactory = throttleFactory;
    }

    var throttle = twitterThrottleFactory(60, 900000);

    return {
        getUsers: function(userIds){
            return promise.create((fulfill, reject) => {
                throttle.execute(() => {
                    twitterClient.getCustomApiCall(
                        '/users/lookup.json',
                        { user_id: userIds.join(",")},
                        (err) => {
                            console.log("twitterDataService.getUsers.errorStatusCode", err.statusCode);

                            if(err.statusCode !== 404)
                            {
                                reject(err);
                                return;
                            }

                            var result = createUsernamesForMissingIds(userIds, []);

                            fulfill(result);
                        },
                        (body) => {
                            var retrievedUsernames = getUsernamesFromJson(body);
                            var missingUsernames = createUsernamesForMissingIds(userIds, retrievedUsernames);
                            var result = retrievedUsernames.concat(missingUsernames);

                            fulfill(result);
                        }
                    );
                });
            })
        }
    };

    function getUsernamesFromJson(body){
        return JSON
            .parse(body)
            .map((u) => {
                return {
                    id: u.id.toString(),
                    name: u.screen_name
                };
            });
    }

    function createUsernamesForMissingIds(requestedIds, receivedUsernames){
        console.log("twitterDataService.getUsers",
            "requestedIdsCount", requestedIds.length,
            "receivedIdsCount", receivedUsernames.length
        );


        if (receivedUsernames.length === requestedIds.length){
            return [];
        }

        var receivedIds = receivedUsernames.map((u) => {
            return u.id;
        });

        var missingIds = userIdHelper.getMissingIds(requestedIds, receivedIds);
        console.log("twitterDataService.getUsers.missingIds", missingIds);

        return missingIds.map((id) => {
            return {
                id: id.toString(),
                name: ""
            };
        });
    }
};