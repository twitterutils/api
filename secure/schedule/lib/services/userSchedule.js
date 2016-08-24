var promise = require("the-promise-factory");

module.exports = function (userScheduleDataService) {
    return {
        update: (userId) => {
            return promise.create((fulfill, reject) => {

                userScheduleDataService
                    .first(userId)
                    .then((scheduleInfo) => {
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

                        userScheduleDataService
                            .update(userId, updatedStatus)
                            .then(fulfill, reject);

                    }, reject);
            })
        }
    }
}