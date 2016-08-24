var promise = require("the-promise-factory");

module.exports = function (userScheduleDataService) {
    return {
        update: (userId) => {
            return promise.create((fulfill, reject) => {
                reject("seeded error");
            })
        }
    }
}