var promise = require("the-promise-factory");
var _ = require("underscore");
var twitterNodeClientFactory = require("twitter-node-client-factory");
var throttleFactory = require("throttle-factory");

module.exports = function(twitterClient, twitterThrottleFactory){
    if (!twitterClient){
        twitterClient = twitterNodeClientFactory(
            null, null, null,
            "TWU_CRON_GRAPH_TWITTER_CONSUMER_KEY",
            "TWU_CRON_GRAPH_TWITTER_CONSUMER_SECRET"
        );
    }

    if (!twitterThrottleFactory){
        twitterThrottleFactory = throttleFactory;
    }

    var throttle = twitterThrottleFactory(15, 900000);

    return {
        getFollowers: function(userName){
            return twitterIdsApiCall(userName, "/followers/ids.json", "GetTwitterFollowers");
        },
        getFriends: function(userName){
            return twitterIdsApiCall(userName, "/friends/ids.json", "GetTwitterFriends");
        }
    };

    function twitterIdsApiCall(userName, url, methodName){
        return promise.create((fulfill, reject) => {
            callApi(-1, fulfill, reject, []);
        });

        function callApi(cursor, fulfillCallback, rejectCallback, result){
            throttle.execute(() => {
                callApiInternal(cursor, fulfillCallback, rejectCallback, result);
            });
        }

        function callApiInternal(cursor, fulfillCallback, rejectCallback, result) {
            var apiParams = {
                screen_name: userName,
                cursor: cursor
            };
            console.log("twitterDataService." + methodName, apiParams);

            twitterClient.getCustomApiCall(
                url,
                apiParams,
                rejectCallback,
                (apiResponseInfoStr) => {
                    var apiResponse = JSON.parse(apiResponseInfoStr);
                    result = result.concat(apiResponse.ids);

                    if (apiResponse.next_cursor === 0){
                        result = _.uniq(result).map((id) => {
                            return id.toString();
                        });

                        console.log(
                            "twitterDataService." + methodName + ".completed",
                            "screen_name=", apiParams.screen_name, 
                            "resultLength=", (result || []).length
                        );

                        fulfillCallback(result);
                        return;
                    }

                    callApi(apiResponse.next_cursor, fulfillCallback, rejectCallback, result);
                }
            );
        }
    }
};