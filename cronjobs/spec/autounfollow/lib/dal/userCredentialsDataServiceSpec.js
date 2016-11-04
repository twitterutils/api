var rfr = require("rfr");
var userCredentialsDataService = rfr("autounfollow/lib/dal/userCredentialsDataService");

describe("userCredentialsDataService", function(){
    var seededError = null;
    var seededResponse = null;
    var seededBody = null;
    var dataService = null;

    beforeEach(function(){
        process.env.TWU_CRON_LOGIN_API_BASE_URL = "mybaseurl";
        process.env.TWU_CRON_LOGIN_API_KEY = "apikey";

        seededError = null;
        seededResponse = null;
        seededBody = null;
        dataService = null;

        var requestStub = function(reqParams, callback){
            if (reqParams.headers.Authorization === "apikey" &&
                reqParams.url === "mybaseurl/secure/login/api/v1/user/myuserid/"){
                callback(seededError, seededResponse, seededBody);
            }
        };

        dataService = userCredentialsDataService(requestStub);

        spyOn(console, "log")
    });

    it("returns an error when the http response code is not 200", function(done){
        seededResponse = {statusCode: 500};

        dataService
            .first("myuserid")
            .then(null, (err) => {
                expect(err).toBe("Invalid response Code 500");
                done();
            });
    });

    it("returns an error when the request failed", function(done){
        seededError = "something went wrong";

        dataService
            .first("myuserid")
            .then(null, (err) => {
                expect(err).toBe("something went wrong");
                done();
            });
    });

    it("parses the response body", function(done){
        seededResponse = {statusCode: 200};
        seededBody = '{"oauth_access_token":"secret1","oauth_access_token_secret":"secret2"}';

        dataService
            .first("myuserid")
            .then((result) => {
                expect(result).toEqual({
                    id: "myuserid",
                    oauth_access_token:"secret1",
                    oauth_access_token_secret:"secret2"
                });
                done();
            });
    });
});
