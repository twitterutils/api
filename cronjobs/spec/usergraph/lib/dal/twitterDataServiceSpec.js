var rfr = require("rfr");
var twitterDataService = rfr("usergraph/lib/dal/twitterDataService");

describe("twitterDataService", function(){
    var twitterClientStub = null;
    var twitterThrottleStub = null;
    var dataService = null;
    var throttledApiRequestsCount = 0;

    beforeEach(function(){
        twitterClientStub = {
            getCustomApiCall: function(){}
        };

        throttledApiRequestsCount = 0;
        twitterThrottleStub = {
            execute: function(callback){
                throttledApiRequestsCount++;
                callback();
            }
        };
        spyOn(twitterThrottleStub, "execute").and.callThrough();
        var twitterThrottleFactory = function(reqCount, msInterval){
            if (reqCount === 15 && msInterval === 900000){
                return twitterThrottleStub;
            }
        };

        dataService = twitterDataService(twitterClientStub, twitterThrottleFactory);

        spyOn(console, "log");
    });

    describe("getFollowers", function(){
        it("returns the followers array", function(done){
            spyOn(twitterClientStub, "getCustomApiCall")
                .and
                .callFake((url, callParams, errCallback, successCallback) => {
                    if (url === "/followers/ids.json" &&
                        callParams.screen_name === "lolo" &&
                        callParams.cursor === -1){
                        successCallback("{ \
                            \"ids\":[444444,222222,3333333], \
                            \"next_cursor\":0, \
                            \"next_cursor_str\":\"0\", \
                            \"previous_cursor\":0, \
                            \"previous_cursor_str\":\"0\" \
                        }");
                    }
                });

            dataService
                .getFollowers("lolo")
                .then((result) => {
                    expect(result).toEqual([
                        "444444","222222","3333333"
                    ]);
                    done();
                });
        });

        it("throttles the twitter requests", function(done){
            spyOn(twitterClientStub, "getCustomApiCall")
                .and
                .callFake((url, callParams, errCallback, successCallback) => {
                    if (url === "/followers/ids.json" &&
                        callParams.screen_name === "lolo" &&
                        callParams.cursor === -1){
                        successCallback("{ \
                            \"ids\":[444444,222222,3333333], \
                            \"next_cursor\":0, \
                            \"next_cursor_str\":\"0\", \
                            \"previous_cursor\":0, \
                            \"previous_cursor_str\":\"0\" \
                        }");
                    }
                });

            dataService
                .getFollowers("lolo")
                .then((result) => {
                    expect(throttledApiRequestsCount).toBe(1);
                    done();
                });
        });

        it("returns api errors", function(done){
            spyOn(twitterClientStub, "getCustomApiCall")
                .and
                .callFake((url, callParams, errCallback, successCallback) => {
                    errCallback("something went wrong");
                });

            dataService
                .getFollowers("lolo")
                .then(null, (error) => {
                    expect(error).toEqual("something went wrong");
                    done();
                });
        });

        it("returns all followers from multiple api calls", function(done){
            spyOn(twitterClientStub, "getCustomApiCall")
                .and
                .callFake((url, callParams, errCallback, successCallback) => {
                    if (url !== "/followers/ids.json" ||
                        callParams.screen_name !== "lolo") return;

                    if (callParams.cursor === -1){
                        successCallback("{ \
                            \"ids\":[444444,222222,3333333], \
                            \"next_cursor\":8, \
                            \"next_cursor_str\":\"8\", \
                            \"previous_cursor\":0, \
                            \"previous_cursor_str\":\"0\" \
                        }");
                        return;
                    }

                    if (callParams.cursor === 8){
                        successCallback("{ \
                            \"ids\":[666666,999999], \
                            \"next_cursor\":77, \
                            \"next_cursor_str\":\"77\", \
                            \"previous_cursor\":8, \
                            \"previous_cursor_str\":\"8\" \
                        }");
                        return;
                    }

                    if (callParams.cursor === 77){
                        successCallback("{ \
                            \"ids\":[55,44], \
                            \"next_cursor\":0, \
                            \"next_cursor_str\":\"0\", \
                            \"previous_cursor\":0, \
                            \"previous_cursor_str\":\"0\" \
                        }");
                        return;
                    }
                });

            dataService
                .getFollowers("lolo")
                .then((result) => {
                    expect(result).toEqual([
                        "444444","222222","3333333","666666","999999","55","44"
                    ]);
                    expect(throttledApiRequestsCount).toBe(3);
                    done();
                });
        });

        it("removes duplicated entries in the response", function(done){
            spyOn(twitterClientStub, "getCustomApiCall")
                .and
                .callFake((url, callParams, errCallback, successCallback) => {
                    if (url === "/followers/ids.json" &&
                        callParams.screen_name === "lolo" &&
                        callParams.cursor === -1){
                        successCallback("{ \
                            \"ids\":[444444,222222,3333333,3333333,444444], \
                            \"next_cursor\":0, \
                            \"next_cursor_str\":\"0\", \
                            \"previous_cursor\":0, \
                            \"previous_cursor_str\":\"0\" \
                        }");
                    }
                });

            dataService
                .getFollowers("lolo")
                .then((result) => {
                    expect(result).toEqual([
                        "444444","222222","3333333"
                    ]);
                    done();
                });
        });
    });

    describe("getFriends", function(){
        it("returns the friends array", function(done){
            spyOn(twitterClientStub, "getCustomApiCall")
                .and
                .callFake((url, callParams, errCallback, successCallback) => {
                    if (url === "/friends/ids.json" &&
                        callParams.screen_name === "lolo" &&
                        callParams.cursor === -1){
                        successCallback("{ \
                            \"ids\":[444444,222222,3333333], \
                            \"next_cursor\":0, \
                            \"next_cursor_str\":\"0\", \
                            \"previous_cursor\":0, \
                            \"previous_cursor_str\":\"0\" \
                        }");
                    }
                });

            dataService
                .getFriends("lolo")
                .then((result) => {
                    expect(result).toEqual([
                        "444444","222222","3333333"
                    ]);
                    done();
                });
        });

        it("throttles the twitter requests", function(done){
            spyOn(twitterClientStub, "getCustomApiCall")
                .and
                .callFake((url, callParams, errCallback, successCallback) => {
                    if (url === "/friends/ids.json" &&
                        callParams.screen_name === "lolo" &&
                        callParams.cursor === -1){
                        successCallback("{ \
                            \"ids\":[444444,222222,3333333], \
                            \"next_cursor\":0, \
                            \"next_cursor_str\":\"0\", \
                            \"previous_cursor\":0, \
                            \"previous_cursor_str\":\"0\" \
                        }");
                    }
                });

            dataService
                .getFriends("lolo")
                .then((result) => {
                    expect(throttledApiRequestsCount).toBe(1);
                    done();
                });
        });

        it("returns api errors", function(done){
            spyOn(twitterClientStub, "getCustomApiCall")
                .and
                .callFake((url, callParams, errCallback, successCallback) => {
                    errCallback("something went wrong");
                });

            dataService
                .getFriends("lolo")
                .then(null, (error) => {
                    expect(error).toEqual("something went wrong");
                    done();
                });
        });

        it("returns all friends from multiple api calls", function(done){
            spyOn(twitterClientStub, "getCustomApiCall")
                .and
                .callFake((url, callParams, errCallback, successCallback) => {
                    if (url !== "/friends/ids.json" ||
                        callParams.screen_name !== "lolo") return;

                    if (callParams.cursor === -1){
                        successCallback("{ \
                            \"ids\":[444444,222222,3333333], \
                            \"next_cursor\":8, \
                            \"next_cursor_str\":\"8\", \
                            \"previous_cursor\":0, \
                            \"previous_cursor_str\":\"0\" \
                        }");
                        return;
                    }

                    if (callParams.cursor === 8){
                        successCallback("{ \
                            \"ids\":[666666,999999], \
                            \"next_cursor\":77, \
                            \"next_cursor_str\":\"77\", \
                            \"previous_cursor\":8, \
                            \"previous_cursor_str\":\"8\" \
                        }");
                        return;
                    }

                    if (callParams.cursor === 77){
                        successCallback("{ \
                            \"ids\":[55,44], \
                            \"next_cursor\":0, \
                            \"next_cursor_str\":\"0\", \
                            \"previous_cursor\":0, \
                            \"previous_cursor_str\":\"0\" \
                        }");
                        return;
                    }
                });

            dataService
                .getFriends("lolo")
                .then((result) => {
                    expect(result).toEqual([
                        "444444","222222","3333333","666666","999999","55","44"
                    ]);
                    expect(throttledApiRequestsCount).toBe(3);
                    done();
                });
        });

        it("removes duplicated entries in the response", function(done){
            spyOn(twitterClientStub, "getCustomApiCall")
                .and
                .callFake((url, callParams, errCallback, successCallback) => {
                    if (url === "/friends/ids.json" &&
                        callParams.screen_name === "lolo" &&
                        callParams.cursor === -1){
                        successCallback("{ \
                            \"ids\":[444444,222222,3333333,3333333,444444], \
                            \"next_cursor\":0, \
                            \"next_cursor_str\":\"0\", \
                            \"previous_cursor\":0, \
                            \"previous_cursor_str\":\"0\" \
                        }");
                    }
                });

            dataService
                .getFriends("lolo")
                .then((result) => {
                    expect(result).toEqual([
                        "444444","222222","3333333"
                    ]);
                    done();
                });
        });
    });
});
