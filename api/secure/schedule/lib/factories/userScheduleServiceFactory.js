var rfr = require("rfr");
var userScheduleDataService = rfr("secure/schedule/lib/dal/userScheduleDataService");
var userScheduleService = rfr("secure/schedule/lib/services/userSchedule");

module.exports = function (userScheduleDataServiceFn, userScheduleServiceFn) {
    if (!userScheduleDataServiceFn) {
        userScheduleDataServiceFn = userScheduleDataService;
    }
    if (!userScheduleServiceFn){
        userScheduleServiceFn = userScheduleService;
    }

    return {
        create: (db) => {
            var dataService = userScheduleDataServiceFn(db)
            return userScheduleServiceFn(dataService);
        }
    }
}