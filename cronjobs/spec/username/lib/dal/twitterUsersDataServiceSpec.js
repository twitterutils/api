var rfr = require("rfr");
var twitterDataService2 = rfr("username/lib/dal/twitterUsersDataService");

describe("twitterUsersDataService", function(){
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
            if (reqCount === 60 && msInterval === 900000){
                return twitterThrottleStub;
            }
        };

        dataService = twitterDataService2(twitterClientStub, twitterThrottleFactory);

        spyOn(console, "log");
    });

    describe("getUsers", function(){
        it("fails on error", function(done){
            spyOn(twitterClientStub, "getCustomApiCall")
                .and
                .callFake((url, callParams, errCallback, successCallback) => {
                    errCallback({statusCode: 500});
                });

            dataService
                .getUsers(['783214', '6253282'])
                .then(null, (err) => {
                    expect(err).toEqual({statusCode: 500});
                    done();
                });
        });

        it("returns the userIds and usernames", function(done){
            spyOn(twitterClientStub, "getCustomApiCall")
                .and
                .callFake((url, callParams, errCallback, successCallback) => {
                    if (url === "/users/lookup.json" &&
                        callParams.user_id === "783214,6253282"){
                        successCallback("[ \
                        { \
                            \"name\": \"Twitter API\", \
                            \"id_str\": \"aaa6253282\", \
                            \"id\": 6253282, \
                            \"screen_name\": \"twitterapi\" \
                        }, \
                        { \
                            \"name\": \"Twitter\", \
                            \"id_str\": \"aaa783214\", \
                            \"id\": 783214, \
                            \"screen_name\": \"twitter\" \
                        } \
                        ]");
                    }
                });

            dataService
                .getUsers(['783214', '6253282'])
                .then((result) => {
                    expect(result).toEqual([
                        {id: "6253282", name: "twitterapi"},
                        {id: "783214", name: "twitter"}
                    ]);
                    done();
                });
        });

        it("returns requested objects not returned in the response", function(done){
            spyOn(twitterClientStub, "getCustomApiCall")
                .and
                .callFake((url, callParams, errCallback, successCallback) => {
                    if (url === "/users/lookup.json" &&
                        callParams.user_id === "783214,6253282,00000"){
                        successCallback("[ \
                        { \
                            \"name\": \"Twitter API\", \
                            \"id_str\": \"aaa6253282\", \
                            \"id\": 6253282, \
                            \"screen_name\": \"twitterapi\" \
                        }, \
                        { \
                            \"name\": \"Twitter\", \
                            \"id_str\": \"aaa783214\", \
                            \"id\": 783214, \
                            \"screen_name\": \"twitter\" \
                        } \
                        ]");
                    }
                });

            dataService
                .getUsers(['783214', '6253282', "00000"])
                .then((result) => {
                    expect(result).toEqual([
                        {id: "6253282", name: "twitterapi"},
                        {id: "783214", name: "twitter"},
                        {id: "00000", name: ""}
                    ]);
                    done();
                });
        });

        it("returns empty list on api 404 response", function(done){
            spyOn(twitterClientStub, "getCustomApiCall")
                .and
                .callFake((url, callParams, errCallback, successCallback) => {
                    errCallback({statusCode: 404});
                });

            dataService
                .getUsers(['783214', '6253282'])
                .then((result) => {
                    expect(result).toEqual([
                        {id: "783214", name: ""},
                        {id: "6253282", name: ""},
                    ]);
                    done();
                });
        });

        it("throttles the twitter requests", function(done){
            spyOn(twitterClientStub, "getCustomApiCall")
                .and
                .callFake((url, callParams, errCallback, successCallback) => {
                    if (url === "/users/lookup.json" &&
                        callParams.user_id === "783214,6253282"){
                        successCallback("[ \
                            { \
                                \"name\": \"Twitter API\", \
                                \"id_str\": \"6253282\", \
                                \"id\": 6253282, \
                                \"screen_name\": \"twitterapi\" \
                            }, \
                            { \
                                \"name\": \"Twitter\", \
                                \"id_str\": \"783214\", \
                                \"id\": 783214, \
                                \"screen_name\": \"twitter\" \
                            } \
                        ]");
                    }
                });

            dataService
                .getUsers(['783214', '6253282'])
                .then((result) => {
                    expect(throttledApiRequestsCount).toBe(1);
                    done();
                });
        });
    });
});
