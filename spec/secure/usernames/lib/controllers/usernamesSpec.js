var rfr = require("rfr");
var usernamesController = rfr("secure/usernames/lib/controllers/usernames");

describe("usernamesController", function () {
    var res = {
        name: "my web response",
        send: () => {}
    };
    var db = "my database";
    var controller = null;
    var usernamesDataService = null;

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
            if (dbConnectionKey === "TWU_API_USERNAMES_DB_CONNECTION_STRING" &&
                r === res){
                return {
                    then: (successCallback, errorCallback) =>{
                        successCallback(db);
                    }
                };
            }
        };

        usernamesDataService = {
            find: function(){}
        };
        var usernamesDataServiceFactory = (pDb) => {
            if (pDb === db){
                return usernamesDataService;
            }
        };

        controller = usernamesController(
            dbConnection,
            usernamesDataServiceFactory,
            apiKey,
            webError
        );
    });

    describe("find", function(){
        it("returns unauthorized when the api key is invalid", function(){
            controller.find("11111,33333", "invalid key", res);

            expect(webError.unauthorized).toHaveBeenCalledWith(res, "Unauthorized");
        });

        it("returns unexpected when usernames could not be read", function(){
            spyOn(usernamesDataService, "find").and.callFake((userIds) => {
                return {
                    then: (successCallback, errorCallback) => {
                        errorCallback("seeded error");
                    }
                };
            });

            controller.find("11111,33333", "my secret key", res);

            expect(webError.unexpected).toHaveBeenCalledWith(
                res, "Db Error reading notifications", "seeded error"
            );
        });

        it ("returns each user", function(){
            spyOn(usernamesDataService, "find").and.callFake((userIds) => {
                return {
                    then: (successCallback, errorCallback) => {
                        successCallback([
                            {
                                "id": "11111",
                                "userName": "Oatmeal",
                                "version": 1,
                                "creation_time_str": "2016-06-24T00:45:33.573Z"
                            },
                            {
                                "id": "33333",
                                "userName": "xkcd",
                                "version": 1,
                                "creation_time_str": "2016-06-29T16:00:19.942Z"
                            }
                        ]);
                    }
                };
            });

            controller.find("11111,33333", "my secret key", res);

            expect(res.send).toHaveBeenCalledWith([
                {
                    "userId": "11111",
                    "userName": "Oatmeal"
                },
                {
                    "userId": "33333",
                    "userName": "xkcd"
                }
            ]);
        });

        it ("reads the correct usernames", function(){
            spyOn(usernamesDataService, "find").and.callFake((userIds) => {
                return {
                    then: (successCallback, errorCallback) => {
                        successCallback([]);
                    }
                };
            });

            controller.find("1234555,5555", "my secret key", res);

            expect(usernamesDataService.find)
                .toHaveBeenCalledWith(["1234555", "5555"]);
        });
    });
});