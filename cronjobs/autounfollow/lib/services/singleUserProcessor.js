var promise = require("the-promise-factory");
var async = require("async");

module.exports = function(
    userCredentialsDataService,
    userChangesService,
    unfollowActionsBuilder,
    twitterFollowersService,
    notificationsDataService
    ){
    return {
        process: function(user){
            return promise.create((fulfill, reject) => {
                console.log("Processing", user);

                async.parallel({
                    credentials: readCredentials(user),
                    unfollowActions: readUnfollowActions(user)
                }, (err, results) => {
                    if (err) return reject(err);

                    async.forEachOf(
                        results.unfollowActions,
                        unfollowSingleUser(results.credentials),
                        (err) => {
                            if (err) return reject(err);
                            fulfill();
                        }
                    );
                });
            });
        }
    };

    function readCredentials(user){
        return (callback) => {
            userCredentialsDataService
                .first(user.id)
                .then((credentials) => {
                    callback(null, credentials);
                }, callback);
        }
    }

    function readUnfollowActions(user){
        return (callback) => {
            userChangesService
                .read(user)
                .then((userChanges) => {
                    unfollowActionsBuilder
                        .build(userChanges.changes, userChanges.userDetails)
                        .then((actions) => {
                            callback(null, actions);
                        }, callback);
                }, callback);
        };
    }

    function unfollowSingleUser(credentials){
        return (targetUserId, key, callback) => {
            async.series([
                unfollowSingleUserInternal(credentials, targetUserId),
                sendUnfollowNotification(credentials, targetUserId)
            ], (err, results) => {
                if (err) return callback(err);
                callback(null);
            });
        }
    }

    function unfollowSingleUserInternal(credentials, targetUserId){
        return (callback) => {
            twitterFollowersService
                .unfollow(credentials, targetUserId)
                .then(() => {
                    callback(null);
                }, callback);
        };
    }

    function sendUnfollowNotification(credentials, targetUserId){
        return (callback) => {
            notificationsDataService
                .send("unfollow", credentials.id, {target: targetUserId.toString()})
                .then(() => {
                    callback(null);
                }, callback);
        }
    }
};