var promise = require("the-promise-factory");
var isoDateStr = require("iso-date-str");

module.exports = function(db, dateSvc) {
    if (!db) throw new Error("A database is required");
    if (!dateSvc) dateSvc = isoDateStr;

    var MODEL_VERSION = 1.0;

    return {
        update: function(userId, scheduleInfo){
            if (!scheduleInfo) scheduleInfo = {};

            scheduleInfo.id = userId.toString();
            scheduleInfo.version = MODEL_VERSION;
            scheduleInfo.modified_time_str = dateSvc();

            return promise.create((fulfill, reject) => {
                dbCollection()
                    .updateOne(
                        {id: userId.toString()},
                        {
                            $set: scheduleInfo
                        },
                        {upsert: true},
                        handleResult(fulfill, reject)
                    );
            });
        },
        first: function(userId){
            return promise.create((fulfill, reject) => {
                reject("something went wrong")
            })
        }
    }

    function dbCollection(){
        return db.collection("schedule_user_status");
    }

    function handleResult(fulfill, reject) {
        return (err, result) => {
            if (err) return reject(err);

            fulfill(result);
        };
    }
}