var rfr = require("rfr");
var userScheduleController = rfr("secure/schedule/lib/controllers/userSchedule");

describe("userSchedule", function () {
    var controller = null;

    var openedConnections = 0;
    var db = "my database";
    var res = {
        name: "my web response",
        send: () => {}
    };
    var apiKeyStub = null;
    var webErrorStub = null;
    var userScheduleDataServiceStub = null;
    var userScheduleFirstSeededResult = null;
    var userScheduleFirstSeededError  = null;
    var userScheduleUpdateSeededResult = null;
    var userScheduleUpdateSeededError  = null;

    beforeEach(function(){
        spyOn(res, "send");

        apiKeyStub = {
            isValid: (key) => {
                return key === "valid key";
            }
        }

        webErrorStub = {
            unauthorized: () => {},
            unexpected: () => {}
        }
        spyOn(webErrorStub, "unauthorized");
        spyOn(webErrorStub, "unexpected");

        openedConnections = 0;
        var dbConnection = (r, dbConnectionKey) => {
            openedConnections++;
            if (dbConnectionKey === "SCHEDULE_DB_CONNECTION_STRING" &&
                r === res){
                return {
                    then: (successCallback, errorCallback) =>{
                        successCallback(db);
                    }
                };
            }
        };

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

        var userScheduleDataServiceFactory = (pDb) => {
            if (pDb === db){
                return userScheduleDataServiceStub;
            }
        };

        controller = userScheduleController(
            dbConnection,
            userScheduleDataServiceFactory,
            null,
            apiKeyStub,
            webErrorStub
        );
    })

    it("returns unauthorized when the api key is invalid", function(){
        controller.update(111111, "invalid", res);

        expect(webErrorStub.unauthorized).toHaveBeenCalledWith(res, "Unauthorized");
        expect(openedConnections).toBe(0);
    });

    it("returns unexpected when the schedule could not be read", function(){
        userScheduleFirstSeededError = "seeded error";

        controller.update("555555", "valid key", res);

        expect(webErrorStub.unexpected).toHaveBeenCalledWith(
            res, "Error Updating Schedule", "seeded error"
        );
    });

    it("reads the user schedule", function(){
        spyOn(userScheduleDataServiceStub, "first").and.callThrough();
        userScheduleFirstSeededResult = {
            readCount: 1
        };

        controller.update("555555", "valid key", res);

        expect(userScheduleDataServiceStub.first).toHaveBeenCalledWith("555555");
    });

    it("returns unexpected when the schedule could not be updated", function(){
        userScheduleUpdateSeededError = "seeded error";
        userScheduleFirstSeededResult = {
            readCount: 1
        };

        controller.update("555555", "valid key", res);

        expect(webErrorStub.unexpected).toHaveBeenCalledWith(
            res, "Error Updating Schedule", "seeded error"
        );
    });

    it("updates the user schedule", function(){
        spyOn(userScheduleDataServiceStub, "update").and.callThrough();
        userScheduleFirstSeededResult = {
            readCount: 1
        };

        controller.update("555555", "valid key", res);

        expect(userScheduleDataServiceStub.update).toHaveBeenCalledWith("555555", {readCount: 2});
    });

    it("inserts a new schedule for new users", function(){
        spyOn(userScheduleDataServiceStub, "update").and.callThrough();
        userScheduleFirstSeededResult = null;

        controller.update("555555", "valid key", res);

        expect(userScheduleDataServiceStub.update).toHaveBeenCalledWith("555555", {readCount: 1});
    });

    it("returns success", function(){
        spyOn(userScheduleDataServiceStub, "update").and.callThrough();
        userScheduleFirstSeededResult = {
            readCount: 1
        };
        userScheduleUpdateSeededResult = {};

        controller.update("555555", "valid key", res);

        expect(res.send).toHaveBeenCalledWith({success: true});
    });
})
