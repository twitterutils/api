var promise = require("the-promise-factory");
var async = require("async");

module.exports = function (userScheduleDataService) {
    return {
        update: (userId) => {
            return promise.create((fulfill, reject) => {
                async.waterfall([
                    readScheduleInfo(userId),
                    updateScheduleInfo(userId),
                    saveScheduleInfo(userId)
                ], (err) => {
                    if (err) return reject(err);
                    fulfill();
                });
            })
        }
    }

    function readScheduleInfo(userId) {
        return (callback) => {
            userScheduleDataService
                .first(userId)
                .then((result) => {
                    callback(null, result);
                }, callback);
        }
    }

    function updateScheduleInfo(userId){
        return (scheduleInfo, callback) => {
            if (!scheduleInfo){
                scheduleInfo = { readCount: 0 };
            }

            var updatedStatus = {
                readCount: scheduleInfo.readCount + 1
            };

            console.log("Updating-User-Schedule",
                "userId=", userId,
                "readCount", updatedStatus.readCount
            );

            callback(null, updatedStatus);
        }
    }

    function saveScheduleInfo(userId){
        return (scheduleInfo, callback) => {
            userScheduleDataService
                .update(userId, scheduleInfo)
                .then(() => {
                    callback(null)
                }, callback);
        }
    }
}