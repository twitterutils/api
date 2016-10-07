var rfr = require("rfr");

var changesDataService = rfr("username/lib/dal/changesDataService");

describe("changesDataService", function() {
    var seededError = null;
    var seededResponse = null;
    var seededBody = null;
    var dataService = null;
    var expectedApiUrl = null;

    beforeEach(function(){
        process.env.TWU_CRON_GRAPH_API_BASE_URL = "mybaseurl";
        process.env.TWU_CRON_GRAPH_API_KEY = "apikey";

        seededError = null;
        seededResponse = null;
        seededBody = null;
        dataService = null;
        expectedApiUrl = null;

        var requestStub = function(requestOptions, callback){
            if (requestOptions.headers.Authorization === 'apikey' &&
                requestOptions.url === expectedApiUrl){
                callback(seededError, seededResponse, seededBody);
                return;
            }

            jasmine.getEnv().fail("invalid invocation");
        };

        dataService = changesDataService(requestStub);

        spyOn(console, "log");
    });

    describe("userChanges", function(){
        beforeEach(function(){
            expectedApiUrl = "mybaseurl/secure/graph/api/v1/changes/5555555/"
        });

        it("returns an error when the http response code is not 200", function(done){
            seededResponse = {statusCode: 500};

            dataService
                .userChanges(5555555)
                .then(null, (err) => {
                    expect(err).toBe("Invalid response Code");
                    done();
                });
        });

        it("returns an error when the request failed", function(done){
            seededError = "something went wrong";

            dataService
                .userChanges(5555555)
                .then(null, (err) => {
                    expect(err).toBe("something went wrong");
                    done();
                });
        });

        it("parses the response body", function(done){
            seededResponse = {statusCode: 200};
            seededBody = '[{"type":"unfollow","originator":"2795831564","target":"29893096","prevId":"2cd5d730-4618-11e6-8271-d11f6e13bd37","currId":"1a1f7280-462d-11e6-bf64-570316578abf"},\
                {"type":"unfollow","originator":"2488318962","target":"29893096","prevId":"3e6cd130-470b-11e6-a989-73e2ef3a777a","currId":"55437110-4739-11e6-970c-b51b1ce59f50"}]';

            dataService
                .userChanges(5555555)
                .then((results) => {
                    expect(results).toEqual([
                        {
                            type: "unfollow",
                            originator: "2795831564",
                            target: "29893096",
                            prevId: "2cd5d730-4618-11e6-8271-d11f6e13bd37",
                            currId: "1a1f7280-462d-11e6-bf64-570316578abf"
                        },
                        {
                            type: "unfollow",
                            originator: "2488318962",
                            target: "29893096",
                            prevId: "3e6cd130-470b-11e6-a989-73e2ef3a777a",
                            currId: "55437110-4739-11e6-970c-b51b1ce59f50"
                        }
                    ]);
                    done();
                });
        });
    });
})