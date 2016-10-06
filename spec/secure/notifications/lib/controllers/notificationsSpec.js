var rfr = require("rfr");
var notificationsController = rfr("secure/notifications/lib/controllers/notifications");

describe("notifications", function() {
    var controller = null;

    var openedConnections = 0;
    var db = "my database";
    var res = {
        name: "my web response",
        send: () => {}
    };
    var apiKeyStub = null;
    var webErrorStub = null;
    var notificationsDataServiceStub = null;
    var notificationsDataServiceSeededResult = null;
    var notificationsDataServiceSeededError  = null;

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
            if (dbConnectionKey === "TWU_API_NOTIFICATIONS_DB_CONNECTION_STRING" &&
                r === res){
                return {
                    then: (successCallback, errorCallback) =>{
                        successCallback(db);
                    }
                };
            }
        };

        notificationsDataServiceStub = {
            save: () => {}
        }
        notificationsDataServiceSeededResult = null;
        notificationsDataServiceSeededError  = null;
        spyOn(notificationsDataServiceStub, "save").and.callFake((notificationData) => {
            return {
                then: (successCallback, errorCallback) => {
                    if (notificationsDataServiceSeededResult){
                        successCallback(notificationsDataServiceSeededResult);
                        return;
                    }

                    errorCallback(notificationsDataServiceSeededError);
                }
            };
        });

        var notificationsDataServiceFactory = (pDb) => {
            if (pDb === db){
                return notificationsDataServiceStub;
            }
        };

        controller = notificationsController(dbConnection, notificationsDataServiceFactory, apiKeyStub, webErrorStub);

        console.log = () => {};
    });

    it("returns unauthorized when the api key is invalid", function(){
        controller.send({ }, {
            authorization: "invalid"
        }, res);

        expect(webErrorStub.unauthorized).toHaveBeenCalledWith(res, "Unauthorized");
        expect(openedConnections).toBe(0);
    });

    it("saves the notification", function(){
        notificationsDataServiceSeededResult = {};

        controller.send({
            type: "unfollow",
            userid: "1234245",
            details: {
                field1: "value1",
                field2: "value2"
            }
        }, {
            authorization: "valid key"
        }, res);

        expect(webErrorStub.unauthorized).not.toHaveBeenCalled();
        expect(notificationsDataServiceStub.save).toHaveBeenCalledWith({
            type: "unfollow",
            userId: "1234245",
            details: {
                field1: "value1",
                field2: "value2"
            }
        });
    });

    it("returns success when the notification could be saved", function(){
        notificationsDataServiceSeededResult = {};

        controller.send({ }, { authorization: "valid key" }, res);

        expect(res.send).toHaveBeenCalledWith({success: true});
    });

    it("returns unexpected when the notification could not be saved", function(){
        notificationsDataServiceSeededError = "seeded error";

        controller.send({ }, { authorization: "valid key" }, res);

        expect(webErrorStub.unexpected).toHaveBeenCalledWith(
            res, "Error Saving Notification", "seeded error"
        );
    });
});
