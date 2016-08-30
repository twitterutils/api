var rfr = require("rfr")
var scheduleListController = rfr("secure/schedule/lib/controllers/scheduleList");

describe("scheduleList", function() {
    var controller = null;

    var openedConnections = 0;
    var db = "my database";
    var res = {
        name: "my web response",
        send: () => {}
    };
    var apiKeyStub = null;
    var webErrorStub = null;
    var scheduleListServiceStub = null;
    var scheduleListSeededResult = null;
    var scheduleListSeededError = null;

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

        scheduleListSeededResult = [];
        scheduleListSeededError  = null;
        scheduleListServiceStub = {
            all: () => {
                return {
                    then: (successCallback, errorCallback) =>{
                        if (scheduleListSeededError){
                            errorCallback(scheduleListSeededError);
                            return;
                        }

                        successCallback(scheduleListSeededResult);
                    }
                };
            }
        }

        var scheduleListDataServiceFactory = (pDb) => {
            if (pDb === db){
                return scheduleListServiceStub;
            }
        };

        controller = scheduleListController(
            dbConnection,
            scheduleListDataServiceFactory,
            apiKeyStub,
            webErrorStub
        );
    })

    it("returns unauthorized when the api key is invalid", function(){
        controller.all("invalid", res);

        expect(webErrorStub.unauthorized).toHaveBeenCalledWith(res, "Unauthorized");
        expect(openedConnections).toBe(0);
    });

    it("returns unexpected when the schedule list could not be read", function(){
        scheduleListSeededError = "seeded error";

        controller.all("valid key", res);

        expect(webErrorStub.unexpected).toHaveBeenCalledWith(
            res, "Error Updating Schedule", "seeded error"
        );
    });

    it("reads the schedule", function(){
        scheduleListSeededResult = [
            {userId: "33333"},
            {userId: "66666"},
            {userId: "77777"}
        ];

        controller.all("valid key", res);

        expect(res.send).toHaveBeenCalledWith([
            "33333", "66666", "77777"
        ]);
    });
})