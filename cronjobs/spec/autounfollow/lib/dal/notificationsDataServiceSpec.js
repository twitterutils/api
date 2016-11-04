var rfr = require("rfr");
var notificationsDataService = rfr("autounfollow/lib/dal/notificationsDataService");

describe("notificationsDataService", function() {
    var seededError = null;
    var seededResponse = null;
    var seededBody = null;
    var dataService = null;
    var requestJson = null;

    beforeEach(function(){
        process.env.TWU_CRON_NOTIFICATIONS_API_BASE_URL = "mybaseurl";
        process.env.TWU_CRON_NOTIFICATIONS_API_KEY = "apikey";

        seededError = null;
        seededResponse = null;
        seededBody = null;
        dataService = null;
        requestJson = null;

        var requestStub = function(reqParams, callback){
            if (reqParams.method === "POST" &&
                reqParams.headers.Authorization === "apikey" &&
                reqParams.headers["Content-Type"] === "application/json" &&
                reqParams.url === "mybaseurl/secure/notifications/api/v1/send/"){
                requestJson = reqParams.json;
                callback(seededError, seededResponse, seededBody);
            }
        };

        dataService = notificationsDataService(requestStub);

        spyOn(console, "log")
    });

    it ("sends the notification details", function(done){
        seededResponse = {statusCode: 200};
        seededBody = {success: true};

        dataService
            .send("unfollow", 111111, {val1: "something"})
            .then((result) => {
                expect(result).toEqual({success: true});
                expect(requestJson).toEqual({
                    type: "unfollow",
                    userid: "111111", 
                    details: {
                        val1: "something"
                    }
                });
                done();
            });
    });

    it("returns an error when the request failed", function(done){
        seededError = "something went wrong";

        dataService
            .send("unfollow", "888777")
            .then(null, (err) => {
                expect(err).toBe("something went wrong");
                done();
            });
    });

    it("returns an error when the http response code is not 200", function(done){
        seededResponse = {statusCode: 500};

        dataService
            .send("unfollow", "555566")
            .then(null, (err) => {
                expect(err).toBe("Invalid response Code 500");
                done();
            });
    });
});