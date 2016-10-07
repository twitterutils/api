var promise = require("the-promise-factory");
var isoDateStr = require("iso-date-str");

module.exports = function(db, dateSvc){
    if (!db) throw new Error("A database is required");
    if (!dateSvc) dateSvc = isoDateStr;

    var MODEL_VERSION = 1.0;

    return {
        first: (userId) => {
            return promise.create((fulfill, reject) => {
                dbCollection()
                    .findOne(
                        {id: userId.toString()},
                        handleResult(fulfill, reject)
                    );
            });
        },
        save: (userId, graphId) => {
            return promise.create((fulfill, reject) => {
                dbCollection()
                    .updateOne(
                        {id: userId.toString()},
                        {
                            $set: {
                                id: userId.toString(),
                                graphId: graphId,
                                version: MODEL_VERSION,
                                modified_time_str: dateSvc()
                            }
                        },
                        {upsert: true},
                        handleResult(fulfill, reject)
                    );
            });
        }
    };

    function handleResult(fulfill, reject) {
        return (err, result) => {
            if (err) return reject(err);

            fulfill(result);
        };
    }

    function dbCollection(){
        return db.collection("autounfollow_user_status");
    }
};