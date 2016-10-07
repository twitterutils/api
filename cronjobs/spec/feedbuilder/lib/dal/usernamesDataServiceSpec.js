var rfr = require("rfr");
var usernamesDataService = rfr("feedbuilder/lib/dal/usernamesDataService");

describe("usernamesDataService", function() {
    var seededError = null;
    var seededResponse = null;
    var seededBody = null;
    var dataService = null;
    var expectedApiUrl = null;

    beforeEach(function(){
        process.env.TWU_CRON_USERNAMES_API_BASE_URL = "mybaseurl";
        process.env.TWU_CRON_USERNAMES_API_KEY = "apikey";

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

        dataService = usernamesDataService(requestStub);

        spyOn(console, "log");
    });

    describe("find", function(){
        beforeEach(function(){
            expectedApiUrl = "mybaseurl/secure/usernames/api/v1/find/29893096,50457174,2746028153/"
        });

        it("returns an error when the http response code is not 200", function(done){
            seededResponse = {statusCode: 500};

            dataService
                .find(["29893096","50457174","2746028153"])
                .then(null, (err) => {
                    expect(err).toBe("Invalid response Code");
                    done();
                });
        });

        it("returns an error when the request failed", function(done){
            seededError = "something went wrong";

            dataService
                .find(["29893096","50457174","2746028153"])
                .then(null, (err) => {
                    expect(err).toBe("something went wrong");
                    done();
                });
        });

        it("parses the response body", function(done){
            seededResponse = {statusCode: 200};
            seededBody = '[{"userId":"2746028153","userName":"RainDna"},\
                {"userId":"50457174","userName":"cashproductions"},\
                {"userId":"29893096","userName":"camilin87"}]';

            dataService
                .find(["29893096","50457174","2746028153"])
                .then((results) => {
                    expect(results).toEqual([
                        {
                            "userId": "2746028153",
                            "userName": "RainDna"
                        },
                        {
                            "userId": "50457174",
                            "userName": "cashproductions"
                        },
                        {
                            "userId": "29893096",
                            "userName": "camilin87"
                        }
                    ]);
                    done();
                });
        });
    });
})