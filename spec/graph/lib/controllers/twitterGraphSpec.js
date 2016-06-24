var rfr = require("rfr");
var twitterGraphController = rfr("lib/controllers/twitterGraph");

describe("twitterGraph", function() {
    var res = {
        name: "my web response",
        send: () => {}
    };
    var db = "my database";
    var controller = null;
    var webError = null;
    var twitterGraph = null;

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

        twitterGraph = {
            first: function(){}
        };
        var twitterGraphFactory = (pDb) => {
            if (pDb === db){
                return twitterGraph;
            }
        };

        controller = twitterGraphController(dbConnection, twitterGraphFactory, apiKey, webError);
    });

    describe("details", function(){
        it("returns unauthorized when the api key is invalid", function(){
            controller.details("my graphId", "invalid key", res);

            expect(webError.unauthorized).toHaveBeenCalledWith(res, "Unauthorized");
        });

        it("returns unexpected when graphs could not be read", function(){
            spyOn(twitterGraph, "first").and.callFake((graphId) => {
                if (graphId === "my graphId"){
                    return {
                        then: (successCallback, errorCallback) => {
                            errorCallback("seeded error");
                        }
                    };
                }
            });

            controller.details("my graphId", "my secret key", res);

            expect(webError.unexpected).toHaveBeenCalledWith(
                res, "Db Error finding users", "seeded error"
            );
        });

        it("returns notfound when the graph could not be found", function(){
            spyOn(twitterGraph, "first").and.callFake((graphId) => {
                if (graphId === "my graphId"){
                    return {
                        then: (successCallback, errorCallback) => {
                            successCallback(null);
                        }
                    };
                }
            });

            controller.details("my graphId", "my secret key", res);

            expect(webError.notFound).toHaveBeenCalledWith(
                res, "Graph not found"
            );
        });

        it("returns the twitter graph details", function(){
            spyOn(twitterGraph, "first").and.callFake((graphId) => {
                if (graphId === "my graphId"){
                    return {
                        then: (successCallback, errorCallback) => {
                            successCallback({
                                _id: {
                                    $oid: "57256a3bc4d2ca3400abf286"
                                },
                                id: "50457174",
                                graphId: "a6007760-0f44-11e6-b34d-5580091b6343",
                                userName: "cashproductions",
                                friends: [18479513, 14843763],
                                followers: [359711363, 102961213],
                                version: 1.1,
                                modified_time_str: "2016-05-01T02:30:19.902Z"
                            });
                        }
                    };
                }
            });

            controller.details("my graphId", "my secret key", res);

            expect(res.send).toHaveBeenCalledWith({
                id: "50457174",
                graphId: "a6007760-0f44-11e6-b34d-5580091b6343",
                userName: "cashproductions",
                friends: [18479513, 14843763],
                followers: [359711363, 102961213]
            });
        });
    });
});