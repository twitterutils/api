var promise = require("the-promise-factory");
var async = require("async");

module.exports = function (userScheduleBuilder, upcomingScheduleDataService) {
    return {
        update: function(){
            return promise.create((fufill, reject) => {
                async.waterfall([
                    buildSchedule,
                    printUpdatedSchedule,
                    clearUpcomingSchedule,
                    updateUpcomingSchedule
                ], (err) => {
                    if (err){
                        reject(err);
                        return;
                    }

                    fufill();
                })
            })
        }
    }

    function buildSchedule(callback){
        userScheduleBuilder
            .build()
            .then((userIds) => {
                callback(null, userIds || []);
            }, callback);
    }

    function printUpdatedSchedule(userIds, callback){
        console.log("UpdatedSchedule");

        userIds.forEach((id, idx) => {
            console.log("index=", idx, "userId=", id);
        });

        callback(null, userIds);
    }

    function clearUpcomingSchedule(userIds, callback){
        upcomingScheduleDataService
            .clear()
            .then(() => {
                callback(null, userIds);
            }, callback);
    }

    function updateUpcomingSchedule(userIds, callback){
        upcomingScheduleDataService
            .insert(userIds)
            .then(() => {
                callback(null);
            }, callback);
    }
}