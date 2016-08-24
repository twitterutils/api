var rfr = require("rfr");
var userScheduleService = rfr("secure/schedule/lib/services/userSchedule");

describe("userScheduleService", function() {
    var service = null;

    var userScheduleDataServiceStub = null;
    var userScheduleFirstSeededResult = null;
    var userScheduleFirstSeededError  = null;
    var userScheduleUpdateSeededResult = null;
    var userScheduleUpdateSeededError = null;

    beforeEach(function(){
        userScheduleFirstSeededResult = null;
        userScheduleFirstSeededError  = null;
        userScheduleUpdateSeededResult = null;
        userScheduleUpdateSeededError  = null;
        userScheduleDataServiceStub = {
            first: (userId) => {
                return {
                    then: (successCallback, errorCallback) => {
                        if (userScheduleFirstSeededError){
                            errorCallback(userScheduleFirstSeededError);
                            return;
                        }

                        successCallback(userScheduleFirstSeededResult);
                    }
                };
            },
            update: (userId, scheduleInfo) => {
                return {
                    then: (successCallback, errorCallback) => {
                        if (userScheduleUpdateSeededError){
                            errorCallback(userScheduleUpdateSeededError);
                            return;
                        }

                        successCallback(userScheduleUpdateSeededResult);
                    }
                };
            }
        };

        service = userScheduleService(userScheduleDataServiceStub)
    })
})