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
    });

    it("returns unexpected when the schedule could not be read", function(done){
        userScheduleFirstSeededError = "seeded error";

        service.update("555555")
            .then(null, (err) => {
                expect(err).toBe("seeded error");
                done();
            });
    });

    it("reads the user schedule", function(done){
        spyOn(userScheduleDataServiceStub, "first").and.callThrough();
        userScheduleFirstSeededResult = {
            readCount: 1
        };

        service.update("555555")
            .then(() => {
                expect(userScheduleDataServiceStub.first).toHaveBeenCalledWith("555555");
                done();
            });
    });

    it("returns unexpected when the schedule could not be updated", function(done){
        userScheduleUpdateSeededError = "seeded error";
        userScheduleFirstSeededResult = {
            readCount: 1
        };

        service.update("555555");

        service.update("555555")
            .then(null, (err) => {
                expect(err).toBe("seeded error");
                done();
            });
    });

    it("updates the user schedule", function(done){
        spyOn(userScheduleDataServiceStub, "update").and.callThrough();
        userScheduleFirstSeededResult = {
            readCount: 1
        };

        service.update("555555")
            .then(() => {
                expect(userScheduleDataServiceStub.update).toHaveBeenCalledWith("555555", {readCount: 2});
                done();
            });
    });


})