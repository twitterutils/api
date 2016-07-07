var rfr = require("rfr");
var userNotificationsController = rfr("feed/lib/controllers/userNotifications");

describe("userNotifications", function () {
    var res = {
        name: "my web response",
        send: () => {}
    };
    var db = "my database";
    var controller = null;
    var notificationsDataService = null;

    beforeEach(function(){
        spyOn(res, "send");

        webError = {
            unauthorized: function(){},
            unexpected: function(){},
            notFound: function(){}
        };
        spyOn(webError, "unauthorized");
        spyOn(webError, "unexpected");
        spyOn(webError, "notFound");

        var apiKey = {
            isValid: (key) => {
                return key === "my secret key";
            }
        };

        var dbConnection = (r, dbConnectionKey) => {
            if (dbConnectionKey === "NOTIFICATIONS_DB_CONNECTION_STRING" &&
                r === res){
                return {
                    then: (successCallback, errorCallback) =>{
                        successCallback(db);
                    }
                };
            }
        };

        notificationsDataService = {
            recentNotifications: function(){}
        };
        var notificationsDataServiceFactory = (pDb) => {
            if (pDb === db){
                return notificationsDataService;
            }
        };

        controller = userNotificationsController(
            dbConnection,
            notificationsDataServiceFactory,
            apiKey,
            webError
        );
    });

    describe("recent", function(){
        it("returns unauthorized when the api key is invalid", function(){
            controller.recent("1234555", 100, "invalid key", res);

            expect(webError.unauthorized).toHaveBeenCalledWith(res, "Unauthorized");
        });

        it("returns unexpected when notifications could not be read", function(){
            spyOn(notificationsDataService, "recentNotifications").and.callFake((userId, maxCount) => {
                return {
                    then: (successCallback, errorCallback) => {
                        errorCallback("seeded error");
                    }
                };
            });

            controller.recent("1234555", 100, "my secret key", res);

            expect(webError.unexpected).toHaveBeenCalledWith(
                res, "Db Error reading notifications", "seeded error"
            );
        });
    });
});