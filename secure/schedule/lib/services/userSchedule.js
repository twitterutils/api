var promise = require("the-promise-factory");

module.exports = function (userScheduleDataService) {
    return {
        update: (userId) => {
            return promise.create((fulfill, reject) => {

                userScheduleDataService
                    .first(userId)
                    .then((scheduleInfo) => {

                        userScheduleDataService
                            .update(userId, scheduleInfo)
                            .then(fulfill, reject);

                    }, reject);
            })
        }
    }
}