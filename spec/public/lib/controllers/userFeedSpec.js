var rfr = require("rfr");
var userFeedController = rfr("public/lib/controllers/userFeed");

describe("userFeed", function () {
    var res = {
        name: "my web response",
        send: () => {}
    };
    var controller = null;

    var db = {name: "my db"};
    var readDbConnectionString = null;
    var seededDbError = null;

    var userFeedDataServiceStub = null;
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

        seededDbError = null;
        readDbConnectionString = null;
        var dbConnectionFactoryStub = (r, connString) => {
            if (r !== res){
                return jasmine.getEnv().fail("invalid invocation");
            }

            readDbConnectionString = connString;

            return {
                then: (fulfill, reject) => {
                    if (seededDbError){
                        reject(seededDbError);
                        return;
                    }

                    fulfill(db);
                }
            }
        };

        userFeedDataServiceStub = {
            read: () => {}
        }

        var userFeedDataServiceFactory = (pDb) => {
            if (pDb !== db){
                return jasmine.getEnv().fail("invalid invocation");
            }

            return userFeedDataServiceStub;
        }

        controller = userFeedController(
            dbConnectionFactoryStub,
            userFeedDataServiceFactory,
            webError
        );
    })

    it ("opens a db connection", function(){
        spyOn(userFeedDataServiceStub, "read").and.callFake((userName) => {
            return {
                then: (fulfill, reject) => {
                    fulfill([]);
                }
            }
        });

        controller.read("lolo", res);

        expect(readDbConnectionString).toBe("FEEDBUILDER_DB_CONNECTION_STRING");
    });

    it ("reads the user feed", function(){
        spyOn(userFeedDataServiceStub, "read").and.callFake((userName) => {
            return {
                then: (fulfill, reject) => {
                    fulfill([]);
                }
            }
        });

        controller.read("lolo", res);

        expect(userFeedDataServiceStub.read).toHaveBeenCalledWith("lolo");
    });

    it("returns unexpected when notifications could not be read", function(){
        spyOn(userFeedDataServiceStub, "read").and.callFake((userName) => {
            return {
                then: (successCallback, errorCallback) => {
                    errorCallback("seeded error");
                }
            };
        });

        controller.read("1234555", res);

        expect(webError.unexpected).toHaveBeenCalledWith(
            res, "Db Error reading user feed", "seeded error"
        );
    });

    it("returns notFound when the feed could not be found", function(){
        spyOn(userFeedDataServiceStub, "read").and.callFake((userName) => {
            return {
                then: (successCallback, errorCallback) => {
                    successCallback(null);
                }
            };
        });

        controller.read("1234555", res);

        expect(webError.notFound).toHaveBeenCalledWith(
            res, "User not found"
        );
    });

    it ("returns the user feed", function(){
        spyOn(userFeedDataServiceStub, "read").and.callFake((userName) => {
            return {
                then: (fulfill, reject) => {
                    fulfill([
                        {
                            "id": "576c82ad6a14de2400ea4dfe",
                            "type": "unfollow",
                            "userId": "29893096",
                            "details": {
                                "target": "3044090736",
                                "userName": "TddApps",
                                "url": "https://twitter.com/@TddApps"
                            },
                            "userName": "camilin87",
                            "url": "https://twitter.com/@camilin87"
                        },
                        {
                            "id": "5773f0938583b42400868cbb",
                            "type": "unfollow",
                            "userId": "29893096",
                            "details": {
                                "target": "4847284508",
                                "userName": "programmer_rep",
                                "url": "https://twitter.com/@programmer_rep"
                            },
                            "userName": "camilin87",
                            "url": "https://twitter.com/@camilin87"
                        }
                    ]);
                }
            }
        });

        controller.read("lolo", res);

        expect(res.send).toHaveBeenCalledWith([
            {
                "id": "576c82ad6a14de2400ea4dfe",
                "type": "unfollow",
                "userId": "29893096",
                "details": {
                    "target": "3044090736",
                    "userName": "TddApps",
                    "url": "https://twitter.com/@TddApps"
                },
                "userName": "camilin87",
                "url": "https://twitter.com/@camilin87"
            },
            {
                "id": "5773f0938583b42400868cbb",
                "type": "unfollow",
                "userId": "29893096",
                "details": {
                    "target": "4847284508",
                    "userName": "programmer_rep",
                    "url": "https://twitter.com/@programmer_rep"
                },
                "userName": "camilin87",
                "url": "https://twitter.com/@camilin87"
            }
        ]);
    });
})