var rfr = require("rfr");
var userScheduleController2 = rfr("secure/schedule/lib/controllers/userSchedule2");

describe("userSchedule2", function () {
    var controller = null;

    var openedConnections = 0;
    var db = "my database";
    var res = {
        name: "my web response",
        send: () => {}
    };
    var apiKeyStub = null;
    var webErrorStub = null;
    var userScheduleServiceStub = null;
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

        userScheduleUpdateSeededResult = null;
        userScheduleUpdateSeededError  = null;
        userScheduleServiceStub = {
            update: (userId) => {
                return {
                    then: (successCallback, errorCallback) =>{
                        if (userScheduleUpdateSeededError){
                            errorCallback(userScheduleUpdateSeededError);
                            return;
                        }

                        successCallback(userScheduleUpdateSeededResult);
                    }
                };
            }
        }

        var userScheduleServiceFactory = {
            create: (pDb) => {
                if (pDb === db){
                    return userScheduleServiceStub;
                }
            }
        };

        controller = userScheduleController2(
            dbConnection,
            userScheduleServiceFactory,
            apiKeyStub,
            webErrorStub
        );
    })

    it("returns unauthorized when the api key is invalid", function(){
        controller.update(111111, "invalid", res);

        expect(webErrorStub.unauthorized).toHaveBeenCalledWith(res, "Unauthorized");
        expect(openedConnections).toBe(0);
    });

    it("returns unexpected when the schedule could not be updated", function(){
        userScheduleUpdateSeededError = "seeded error";

        controller.update("555555", "valid key", res);

        expect(webErrorStub.unexpected).toHaveBeenCalledWith(
            res, "Error Updating Schedule", "seeded error"
        );
    });

    it("returns success", function(){
        spyOn(userScheduleServiceStub, "update").and.callThrough();
        userScheduleUpdateSeededResult = {};

        controller.update("555555", "valid key", res);

        expect(userScheduleServiceStub.update).toHaveBeenCalledWith("555555");
        expect(res.send).toHaveBeenCalledWith({success: true});
    });
})
