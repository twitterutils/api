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

        userScheduleDataServiceStub = {
            first: () => {},
            update: () => {}
        }
        userScheduleFirstSeededResult = null;
        userScheduleFirstSeededError  = null;
        spyOn(userScheduleDataServiceStub, "first").and.callFake((notificationData) => {
            return {
                then: (successCallback, errorCallback) => {
                    if (userScheduleFirstSeededResult){
                        successCallback(userScheduleFirstSeededResult);
                        return;
                    }

                    errorCallback(userScheduleFirstSeededError);
                }
            };
        });

        userScheduleUpdateSeededResult = null;
        userScheduleUpdateSeededError  = null;
        spyOn(userScheduleDataServiceStub, "update").and.callFake((notificationData) => {
            return {
                then: (successCallback, errorCallback) => {
                    if (userScheduleUpdateSeededResult){
                        successCallback(userScheduleUpdateSeededResult);
                        return;
                    }

                    errorCallback(userScheduleUpdateSeededError);
                }
            };
        });

        var userScheduleDataServiceFactory = (pDb) => {
            if (pDb === db){
                return userScheduleDataServiceStub;
            }
        };

        controller = userScheduleController(dbConnection, userScheduleDataServiceFactory, apiKeyStub, webErrorStub);
    })
})