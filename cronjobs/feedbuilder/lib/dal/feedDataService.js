var promise = require("the-promise-factory");
var isoDateStr = require("iso-date-str");

module.exports = function (db, dateSvc) {
    if (!db) throw new Error("A database is required");
    if (!dateSvc) dateSvc = isoDateStr;

    var MODEL_VERSION = 1.0;

    return {
        save: function(user, feedItems){
            return promise.create((fulfill, reject) => {
                console.log("feedDataService.save",
                    "userId=", user.id,
                    "userName=", user.userName,
                    "feedItemsLength=", (feedItems || []).length);

                db
                    .collection("feed_list")
                    .updateOne(
                        {id: user.id.toString()},
                        {
                            $set: {
                                id: user.id.toString(),
                                userName: user.userName,
                                items: feedItems || [],
                                version: MODEL_VERSION,
                                modified_time_str: dateSvc()
                            }
                        },
                        {upsert: true},
                        (err, result) => {
                            if (err) return reject(err);

                            fulfill(result);
                        }
                    );
            })
        }
    }
}