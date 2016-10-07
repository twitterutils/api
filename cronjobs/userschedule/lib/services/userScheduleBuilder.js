var promise = require("the-promise-factory");
var async = require("async");

module.exports = function(registeredUsersDataService, userScheduleDataService) {
    return {
        build: function(){
            return promise.create((fulfill, reject) => {
                async.waterfall([
                    readRegisteredUsers,
                    extractUserIds,
                    readSchedules,
                    filterUserSchedules,
                    extractUserIds
                ], (err, userIds) => {
                    if (err){
                        reject(err);
                        return;
                    }

                    fulfill(userIds);
                })
            });
        }
    }

    function readRegisteredUsers(callback){
        registeredUsersDataService
            .all()
            .then((users) => {
                callback(null, users);
            }, callback);
    }

    function extractUserIds(objects, callback){
        var userIds = (objects || []).map((u) => {
            return u.id.toString();
        });

        callback(null, userIds);
    }

    function readSchedules(userIds, callback){
        userScheduleDataService
            .read(userIds)
            .then((schedules) => {
                callback(null, schedules);
            }, callback);
    }

    function filterUserSchedules(schedules, callback){
        var maxUsersCount = parseInt(process.env.TWU_CRON_MAX_USER_COUNT_PER_SCAN);

        var result = (schedules || [])
            .sort((u1, u2) => {
                return u1.readCount > u2.readCount;
            })
            .splice(0, maxUsersCount);

        callback(null, result);
    }
}