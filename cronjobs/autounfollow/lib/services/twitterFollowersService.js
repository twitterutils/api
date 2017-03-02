var promise = require("the-promise-factory");
var twitterNodeClientFactory = require("twitter-node-client-factory");
var throttleFactory = require("throttle-factory");

module.exports = function (registeredUsersDataService, twitterClientFactory, twitterThrottleFactory) {
    if (!twitterClientFactory){
        twitterClientFactory = twitterNodeClientFactory;
    }

    if (!twitterThrottleFactory){
        twitterThrottleFactory = throttleFactory;
    }

    var throttle = twitterThrottleFactory(15, 300000);

    return {
        unfollow: function(credentials, userId){
            return promise.create((fulfill, reject) => {
                console.log("twitterFollowersService.unfollow; originator=", credentials.id, "target=", userId);
                throttle.execute(() => {
                    var twitterClient = twitterClientFactory(
                        credentials.oauth_access_token,
                        credentials.oauth_access_token_secret,
                        null,
                        "TWU_CRON_AUTOUNFOLLOW_TWITTER_CONSUMER_KEY",
                        "TWU_CRON_AUTOUNFOLLOW_TWITTER_CONSUMER_SECRET"
                    );
                    twitterClient.doPost(
                        twitterClient.baseUrl + "/friendships/destroy.json",
                        {user_id: userId},
                        (err) => {
                            if (shouldDisableUser(err)){
                                disableUser(credentials.id).then(fulfill, reject);
                                return;
                            }

                            if (shouldIgnoreFriendshipDoesNotExistError(err)){
                                fulfill();
                                return;
                            }

                            reject(err);
                        },
                        (apiResponseInfoStr) => {
                            var apiResponse = JSON.parse(apiResponseInfoStr);

                            fulfill(apiResponse.id);
                        }
                    );
                });
            });
        }
    };

    function shouldDisableUser(error){
        return errorContains(error, 403, 220, "UnauthorizedError")
    }

    function shouldIgnoreFriendshipDoesNotExistError(error){
        return errorContains(error, 404, 34, "FriendshipDoesNotExistError")
    }

    function errorContains(error, responseCode, code, message){
         if (error.statusCode !== responseCode){
            return false;
        }

        var errorData = JSON.parse(error.data);
        var result = false;

        errorData.errors.forEach((element, index, array) => {
            if (element.code === code){
                result = true;
            }
        });

        if (result){
            console.log(message, error);
        }

        return result;
    }

    function disableUser(userId){
        console.log("Disable", "user_id=", userId);

        return registeredUsersDataService.disable(userId)
    }
}