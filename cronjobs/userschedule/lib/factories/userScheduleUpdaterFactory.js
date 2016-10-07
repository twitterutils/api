var promise = require("the-promise-factory");
var async = require("async");

module.exports = function(
    userScheduleUpdaterFn,

    userScheduleBuilderFn,
    registeredUsersDataServiceFn,
    userScheduleDataServiceFactoryFn,
    userScheduleDataServiceFn,
    dbConnectionFn,

    upcomingScheduleDataServiceFactoryFn,
    upcomingScheduleDataServiceFn
) {
    return {
        create: function(){
            return promise.create((fulfill, reject) => {
                async.parallel({
                    userScheduleDataService: createUserScheduleDataService,
                    upcomingScheduleDataService: createUpcomingScheduleDataService
                }, (err, data) => {
                    if (err){
                        reject(err);
                        return;
                    }

                    var registeredUsersDataService = registeredUsersDataServiceFn();

                    var userScheduleBuilder = userScheduleBuilderFn(
                        registeredUsersDataService,
                        data.userScheduleDataService
                    );

                    var result = userScheduleUpdaterFn(
                        userScheduleBuilder,
                        data.upcomingScheduleDataService
                    );

                    fulfill(result);
                })
            })
        }
    }

    function createUserScheduleDataService(callback){
        userScheduleDataServiceFactoryFn(userScheduleDataServiceFn, dbConnectionFn)
            .create()
            .then((result) => {
                callback(null, result);
            }, callback);
    }

    function createUpcomingScheduleDataService(callback){
        upcomingScheduleDataServiceFactoryFn(upcomingScheduleDataServiceFn, dbConnectionFn)
            .create()
            .then((result) => {
                callback(null, result);
            }, callback);
    }
}