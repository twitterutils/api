var async = require("async");
var promise = require("the-promise-factory");

module.exports = function (
    notificationsDataService,
    usernamesDataService,
    userIdHelper,
    notificationsTransformer,
    feedDataService) {
    return {
        save: function(user){
            return promise.create((fulfill, reject) => {
                async.waterfall([
                    readNotifications(user),
                    extractNotificationIds,
                    readUsernames,
                    transformNotifications,
                    saveNotifications
                ], (err, result) => {
                    if (err) return reject(err);

                    fulfill();
                });
            });
        }
    };

    function readNotifications(user){
        return (callback) => {
            console.log("userFeedService.readNotifications", user);
            notificationsDataService
                .recentNotifications(user.id)
                .then((notifications) => {
                    callback(null, {
                        user: user,
                        notifications: notifications
                    });
                }, callback);
        }
    }

    function extractNotificationIds(data, callback){
        data.ids = userIdHelper.extractIds(data.notifications)

        callback(null, data);
    }

    function readUsernames(data, callback){
        if ((data.ids || []).length === 0){
            data.usernames = [];
            callback(null, data);
            return;
        }

        usernamesDataService
            .find(data.ids)
            .then((usernames) => {
                data.usernames = usernames;
                callback(null, data);
            }, callback)
    }

    function transformNotifications(data, callback){
        data.transformedNotifications = notificationsTransformer.transform(
            data.usernames,
            data.notifications
        );
        callback(null, data);
    }

    function saveNotifications(data, callback){
         feedDataService
            .save(data.user, data.transformedNotifications)
            .then(() => {
                callback(null);
            }, callback);
    }
}