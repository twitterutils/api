var rfr = require("rfr");
var userNotificationsController = rfr("secure/feed/lib/controllers/userNotifications");

describe("userNotifications", function () {
    var res = {
        name: "my web response",
        send: () => {}
    };
    var db = "my database";
    var controller = null;
    var notificationsDataService = null;

    var webError = null;

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

        it ("returns each notification", function(){
            var seededNotifications = [
                {
                    "_id": {
                        "$oid": "576c82ad6a14de2400ea4dfe"
                    },
                    "type": "unfollow",
                    "userId": "29893096",
                    "details": {
                        "target": 3044090736
                    },
                    "version": 1,
                    "creation_time_str": "2016-06-24T00:45:33.573Z"
                },
                {
                    "_id": {
                        "$oid": "5773f0938583b42400868cbb"
                    },
                    "type": "unfollow",
                    "userId": "29893096",
                    "details": {
                        "target": 4847284508
                    },
                    "version": 1,
                    "creation_time_str": "2016-06-29T16:00:19.942Z"
                }
            ];
            seededNotifications.forEach((n) => {
                n._id.toString = function(){
                    return n._id['$oid'];
                }
            })

            spyOn(notificationsDataService, "recentNotifications").and.callFake((userId, maxCount) => {
                return {
                    then: (successCallback, errorCallback) => {
                        successCallback(seededNotifications);
                    }
                };
            });

            controller.recent("1234555", 100, "my secret key", res);

            expect(res.send).toHaveBeenCalledWith([
                {
                    "id": "576c82ad6a14de2400ea4dfe",
                    "type": "unfollow",
                    "userId": "29893096",
                    "details": {
                        "target": 3044090736
                    },
                    "creation_time_str": "2016-06-24T00:45:33.573Z"
                },
                {
                    "id": "5773f0938583b42400868cbb",
                    "type": "unfollow",
                    "userId": "29893096",
                    "details": {
                        "target": 4847284508
                    },
                    "creation_time_str": "2016-06-29T16:00:19.942Z"
                }
            ]);
        });

        it ("reads the correct notifications", function(){
            spyOn(notificationsDataService, "recentNotifications").and.callFake((userId, maxCount) => {
                return {
                    then: (successCallback, errorCallback) => {
                        successCallback([]);
                    }
                };
            });

            controller.recent("1234555", 100, "my secret key", res);

            expect(notificationsDataService.recentNotifications)
                .toHaveBeenCalledWith("1234555", 100);
        })
    });
});