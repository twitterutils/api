var rfr = require("rfr");

var notificationsDataService = rfr("feedbuilder/lib/dal/notificationsDataService");

describe("notificationsDataService", function () {
    var seededError = null;
    var seededResponse = null;
    var seededBody = null;
    var dataService = null;
    var expectedApiUrl = null;

    beforeEach(function(){
        process.env.TWU_CRON_NOTIFICATIONS_API_BASE_URL = "mybaseurl";
        process.env.TWU_CRON_NOTIFICATIONS_API_KEY = "apikey";

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

        dataService = notificationsDataService(requestStub);

        spyOn(console, "log");
    });

    describe("recentNotifications", function(){
        beforeEach(function(){
            expectedApiUrl = "mybaseurl/secure/feed/api/v1/recentnotifications/5555555/"
        });

        it("returns an error when the http response code is not 200", function(done){
            seededResponse = {statusCode: 500};

            dataService
                .recentNotifications(5555555)
                .then(null, (err) => {
                    expect(err).toBe("Invalid response Code");
                    done();
                });
        });

        it("returns an error when the request failed", function(done){
            seededError = "something went wrong";

            dataService
                .recentNotifications(5555555)
                .then(null, (err) => {
                    expect(err).toBe("something went wrong");
                    done();
                });
        });

        it("parses the response body", function(done){
            seededResponse = {statusCode: 200};
            seededBody = '[{"id":"576c82ad6a14de2400ea4dfe","type":"unfollow","userId":"5555555","details":{"target":"3044090736"},"creation_time_str": "2016-06-24T00:45:33.573Z"},\
                {"id":"5773f0938583b42400868cbb","type":"unfollow","userId":"5555555","details":{"target":"4847284508"},"creation_time_str": "2016-06-24T00:45:33.573Z"}]';

            dataService
                .recentNotifications(5555555)
                .then((results) => {
                    expect(results).toEqual([
                        {
                            "id": "576c82ad6a14de2400ea4dfe",
                            "type": "unfollow",
                            "userId": "5555555",
                            "details": {
                                "target": "3044090736" 
                            },
                            "creation_time_str": "2016-06-24T00:45:33.573Z"
                        },
                        { 
                            "id": "5773f0938583b42400868cbb",
                            "type": "unfollow",
                            "userId": "5555555",
                            "details": {
                                "target": "4847284508" 
                            },
                            "creation_time_str": "2016-06-24T00:45:33.573Z"
                        }
                    ]);
                    done();
                });
        });
    });
});