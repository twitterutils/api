var rfr = require("rfr");
var dataServiceFactory = rfr("lib/factories/dataServiceFactory");

module.exports = function (upcomingScheduleDataServiceFn, dbConnectionFn) {
    return {
        create: function(){
            return dataServiceFactory(dbConnectionFn)
                .create("TWU_CRON_SCHEDULE_DB_CONNECTION_STRING", upcomingScheduleDataServiceFn);
        }
    };
}