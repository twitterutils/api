var rfr = require("rfr");
var userNotificationsController = rfr("feed/lib/controllers/userNotifications");

describe("userNotifications", function () {
    var res = {
        name: "my web response",
        send: () => {}
    };
    var controller = null;

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

        controller = userNotificationsController(
            dbConnection, apiKey, webError
        );
    });

    describe("recent", function(){
        it("returns unauthorized when the api key is invalid", function(){
            controller.recent("1234555", 100, "invalid key", res);

            expect(webError.unauthorized).toHaveBeenCalledWith(res, "Unauthorized");
        });
    });
});