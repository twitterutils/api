var rfr = require("rfr")
var twitterFollowersService = rfr("autounfollow/lib/services/twitterFollowersService")

describe("twitterFollowersService", function () {
    var twitterClientStub = null
    var twitterThrottleStub = null
    var service = null
    var throttledApiRequestsCount = 0

    var lastUsedAccessToken = null
    var lastUsedAccessTokenSecret = null
    var lastUsedCallback = null
    var lastUsedConsumerKey = null
    var lastUsedConsumerSecret = null
    var disabledUsers = null

    beforeEach(function(){
        twitterClientStub = {
            baseUrl: "baseUrl",
            doPost: function(){}
        }

        lastUsedAccessToken = null
        lastUsedAccessTokenSecret = null
        lastUsedCallback = null
        lastUsedConsumerKey = null
        lastUsedConsumerSecret = null

        var twitterClientFactory = function(accessToken, accessTokenSecret, callback, consumerKey, consumerSecret){
            lastUsedAccessToken = accessToken
            lastUsedAccessTokenSecret = accessTokenSecret
            lastUsedCallback = callback
            lastUsedConsumerKey = consumerKey
            lastUsedConsumerSecret = consumerSecret
            return twitterClientStub
        }

        throttledApiRequestsCount = 0
        twitterThrottleStub = {
            execute: function(callback){
                throttledApiRequestsCount++
                callback()
            }
        }
        spyOn(twitterThrottleStub, "execute").and.callThrough()
        var twitterThrottleFactory = function(reqCount, msInterval){
            if (reqCount === 15 && msInterval === 300000){
                return twitterThrottleStub
            }
        }

        disabledUsers = []
        var registeredUsersDataService = {
            disable: (userId) => {
                disabledUsers.push(userId)

                return {
                    then: (callback) => {
                        callback()
                    }
                }
            }
        }

        service = twitterFollowersService(
            registeredUsersDataService, twitterClientFactory, twitterThrottleFactory
        )

        spyOn(console, "log")
    })

    describe("unfollow", function(){
        it("builds the correct request", function(done){
            var invocation = null
            spyOn(twitterClientStub, "doPost")
                .and
                .callFake((url, callParams, errCallback, successCallback) => {
                    invocation = {
                        url: url,
                        callParams: callParams
                    }
                    successCallback("{ \
                        \"id\": \"666666\" \
                    }")
                })


            service
                .unfollow({
                    id: "44455",
                    oauth_access_token: "token",
                    oauth_access_token_secret: "token_secret"
                }, "55555")
                .then((result) => {
                    expect(lastUsedAccessToken).toBe("token")
                    expect(lastUsedAccessTokenSecret).toBe("token_secret")
                    expect(lastUsedCallback).toBe(null)
                    expect(lastUsedConsumerKey).toBe("TWU_CRON_AUTOUNFOLLOW_TWITTER_CONSUMER_KEY")
                    expect(lastUsedConsumerSecret).toBe("TWU_CRON_AUTOUNFOLLOW_TWITTER_CONSUMER_SECRET")

                    expect(invocation.url).toEqual("baseUrl/friendships/destroy.json")
                    expect(invocation.callParams).toEqual({
                        user_id: "55555"
                    })

                    expect(result).toBe("666666")
                    done()
                })
        })

        it("throttles the api requests", function(done){
            spyOn(twitterClientStub, "doPost")
                .and
                .callFake((url, callParams, errCallback, successCallback) => {
                    successCallback("{ \
                        \"id\": \"666666\" \
                    }")
                })

            service
                .unfollow({
                    id: "44455",
                    oauth_access_token: "token",
                    oauth_access_token_secret: "token_secret"
                }, "55555")
                .then((result) => {
                    expect(throttledApiRequestsCount).toBe(1)
                    done()
                })
        })

        it("fails on api failure", function(done){
            spyOn(twitterClientStub, "doPost")
                .and
                .callFake((url, callParams, errCallback, successCallback) => {
                    invocation = {
                        url: url,
                        callParams: callParams
                    }
                    errCallback("something went wrong")
                })

            service
                .unfollow({
                    id: "44455",
                    oauth_access_token: "token",
                    oauth_access_token_secret: "token_secret"
                }, "55555")
                .then(null, (err) => {
                    expect(err).toBe("something went wrong")
                    expect(disabledUsers).toEqual([])
                    done()
                })
        })

        it("disables users that revoked the access token", function(done){
            var seededError = {
                statusCode: 403,
                data: '{"errors":[{"code":220,"message":"Your credentials do not allow access to this resource."}]}'
            }

            spyOn(twitterClientStub, "doPost")
                .and
                .callFake((url, callParams, errCallback, successCallback) => {
                    invocation = {
                        url: url,
                        callParams: callParams
                    }
                    errCallback(seededError)
                })

            service
                .unfollow({
                    id: "44455",
                    oauth_access_token: "token",
                    oauth_access_token_secret: "token_secret"
                }, "55555")
                .then(() => {
                    expect(disabledUsers).toEqual(["44455"])
                    done()
                })
        })

        it("does not blow up when a friendship does not exist", function(done){
            var seededError = {
                statusCode: 404,
                data: '{"errors":[{"code":34,"message":"Sorry, that page does not exist."}]}'
            }

            spyOn(twitterClientStub, "doPost")
                .and
                .callFake((url, callParams, errCallback, successCallback) => {
                    invocation = {
                        url: url,
                        callParams: callParams
                    }
                    errCallback(seededError)
                })

            service
                .unfollow({
                    id: "44455",
                    oauth_access_token: "token",
                    oauth_access_token_secret: "token_secret"
                }, "55555")
                .then(() => {
                    expect(disabledUsers).toEqual([])
                    done()
                })
        })
    })
})