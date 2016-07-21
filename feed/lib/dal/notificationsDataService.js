var promise = require("the-promise-factory");

module.exports = function (db) {
    if (!db) throw new Error("A database is required");

    return {
        recentNotifications: function(userId, maxCount){
            return promise.create((fulfill, reject) => {
                db
                    .collection("notifications_details")
                    .find({userId: userId.toString()})
                    .limit(parseInt(maxCount))
                    .toArray()
                    .then(fulfill, reject);
            });
        }
    };
}