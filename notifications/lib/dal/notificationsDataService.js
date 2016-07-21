var promise = require("the-promise-factory");
var isoDateStr = require("iso-date-str");

module.exports = function (db, dateSvc) {
    if (!db) throw new Error("A database is required");
    if (!dateSvc) dateSvc = isoDateStr;

    var MODEL_VERSION = 1.0;

    return {
        save: function(notification){
            return promise.create((fulfill, reject) => {
                db
                    .collection("notifications_details")
                    .insert({
                        type: notification.type,
                        userId: notification.userId.toString(),
                        details: notification.details,
                        version: MODEL_VERSION,
                        creation_time_str: dateSvc()
                    }, (err, result) => {
                        if (err) return reject(err);

                        fulfill(result);
                    });
            });
        }
    };
}