var promise = require("the-promise-factory");
var async = require("async");

module.exports = function(userScheduleUpdaterFactory){
    return {
        run: () => {
            return promise.create((fulfill, reject) => {
                async.waterfall([
                    createUserScheduleUpdater,
                    updateSchedule
                ], (err) => {
                    if (err){
                        reject(err);
                        return;
                    }

                    fulfill();
                });
            })
        }
    }

    function createUserScheduleUpdater(callback){
        userScheduleUpdaterFactory
            .create()
            .then((updater) => {
                callback(null, updater)
            }, callback);
    }

    function updateSchedule(updater, callback){
        updater
            .update()
            .then(() => {
                callback(null);
            }, callback)
    }
}