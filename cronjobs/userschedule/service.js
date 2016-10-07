var rfr = require("rfr");
var promise = require("the-promise-factory");
var userScheduleUpdaterFactory = rfr("userschedule/lib/factories/userScheduleUpdaterFactory")(
    rfr("userschedule/lib/services/userScheduleUpdater"),
    rfr("userschedule/lib/services/userScheduleBuilder"),
    rfr("lib/dal/registeredUsersDataService"),
    rfr("userschedule/lib/factories/userScheduleDataServiceFactory"),
    rfr("userschedule/lib/dal/userScheduleDataService"),
    rfr("lib/factories/dbConnection"),
    rfr("userschedule/lib/factories/upcomingScheduleDataServiceFactory"),
    rfr("userschedule/lib/dal/upcomingScheduleDataService")
);
var userSchedule = rfr("userschedule/lib/services/userSchedule")(userScheduleUpdaterFactory);

module.exports = {
    run: function () {
        return promise.create((fulfill, reject) => {
            console.log("[USERSCHEDULECRAWLER] crawling...");

            userSchedule
                .run()
                .then(() => {
                    console.log("[USERSCHEDULECRAWLER] crawling complete");
                    fulfill();
                }, (err) => {
                    console.error(err);
                    reject(err);
                })
        });
    }
}