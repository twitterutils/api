var rfr = require("rfr");
var twitterUserController = rfr("lib/controllers/twitterUser");

describe("twitterUser", function() {
    var res = {
        name: "my web response",
        send: () => {}
    };
    var db = "my database";
    var controller = null;
    var webError = null;
    var twitterUser = null;

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

        var dbConnection = (r) => {
            if (r === res){
                return {
                    then: (successCallback, errorCallback) =>{
                        successCallback(db);
                    }
                };
            }
        };

        twitterUser = {
            first: function(){}
        };
        var twitterUserFactory = (pDb) => {
            if (pDb === db){
                return twitterUser;
            }
        };

        controller = twitterUserController(dbConnection, twitterUserFactory, apiKey, webError);
    });

    describe("details", function(){
        it("returns unauthorized when the api key is invalid", function(){
            controller.details("my twitter user id", "invalid key", res);

            expect(webError.unauthorized).toHaveBeenCalledWith(res, "Unauthorized");
        });

        it("returns unexpected when the user could not be read", function(){
            spyOn(twitterUser, "first").and.callFake((twitterUserId) => {
                if (twitterUserId === "my twitter user id"){
                    return {
                        then: (successCallback, errorCallback) => {
                            errorCallback("seeded error");
                        }
                    };
                }
            });

            controller.details("my twitter user id", "my secret key", res);

            expect(webError.unexpected).toHaveBeenCalledWith(
                res, "Db Error finding users", "seeded error"
            );
        });

        it("returns notfound when the user could not be found", function(){
            spyOn(twitterUser, "first").and.callFake((twitterUserId) => {
                if (twitterUserId === "my twitter user id"){
                    return {
                        then: (successCallback, errorCallback) => {
                            successCallback(null);
                        }
                    };
                }
            });

            controller.details("my twitter user id", "my secret key", res);

            expect(webError.notFound).toHaveBeenCalledWith(
                res, "User not found"
            );
        });

        it("returns the twitter user details", function(){
            spyOn(twitterUser, "first").and.callFake((twitterUserId) => {
                if (twitterUserId === "my twitter user id"){
                    return {
                        then: (successCallback, errorCallback) => {
                            successCallback({
                                "_id": {
                                    "$oid": "570715653e0f629ad80f7f71"
                                },
                                "id": "50457174",
                                "userName": "cashproductions",
                                "friends": [18479513, 14843763],
                                "followers": [359711363, 102961213],
                                "version": 1.1,
                                "modified_time_str": "2016-05-12T23:30:06.819Z",
                                "graphId": "75d6e7a0-1899-11e6-b554-bd4d97fbcf6a"
                            });
                        }
                    };
                }
            });

            controller.details("my twitter user id", "my secret key", res);

            expect(res.send).toHaveBeenCalledWith({
                id: "50457174",
                graphId: "75d6e7a0-1899-11e6-b554-bd4d97fbcf6a",
                userName: "cashproductions",
                friends: [18479513, 14843763],
                followers: [359711363, 102961213]
            });
        });
    });
});