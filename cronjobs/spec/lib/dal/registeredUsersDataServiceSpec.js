var rfr = require("rfr");
var registeredUsersDataService = rfr("lib/dal/registeredUsersDataService");

describe("registeredUsersDataService", function(){
    var seededError = null;
    var seededResponse = null;
    var seededBody = null;
    var dataService = null;
    var requestJson = null;
    var expectedUrl = null;

    beforeEach(function(){
        process.env.TWU_CRON_LOGIN_API_BASE_URL = "mybaseurl";
        process.env.TWU_CRON_LOGIN_API_KEY = "apikey";

        seededError = null;
        seededResponse = null;
        seededBody = null;
        dataService = null;
        requestJson = null;
        expectedUrl = null;

        var requestStub = function(requestParams, callback){
            if (requestParams.headers.Authorization === "apikey" &&
                requestParams.url === expectedUrl){
                requestJson = requestParams.json;
                callback(seededError, seededResponse, seededBody);
            }
        };

        dataService = registeredUsersDataService(requestStub);

        spyOn(console, "log");
    });

    describe("all", function(){
        beforeEach(function(){
            expectedUrl = "mybaseurl/secure/login/api/v1/users/";
        })

        it("returns an error when the http response code is not 200", function(done){
            seededResponse = {statusCode: 500};

            dataService
                .all()
                .then(null, (err) => {
                    expect(err).toBe("Invalid response Code");
                    done();
                });
        });

        it("returns an error when the request failed", function(done){
            seededError = "something went wrong";

            dataService
                .all()
                .then(null, (err) => {
                    expect(err).toBe("something went wrong");
                    done();
                });
        });

        it("parses the response body", function(done){
            seededResponse = {statusCode: 200};
            seededBody = '[{"id":"111111111","user_name":"camilin87"}, {"id":"22222","user_name":"tddapps"}]';

            dataService
                .all()
                .then((results) => {
                    expect(results).toEqual([
                        {id: "111111111", userName: "camilin87"},
                        {id: "22222", userName: "tddapps"}
                    ]);
                    done();
                });
        });
    });

    describe("disable", function(){
        beforeEach(function(){
            expectedUrl = "mybaseurl/secure/login/api/v1/disable/";
        })

        it ("sends the userId", function(done){
            seededResponse = {statusCode: 200};
            seededBody = {success: true};

            dataService
                .disable(111111)
                .then((result) => {
                    expect(result).toEqual({success: true});
                    expect(requestJson).toEqual({
                        userid: "111111"
                    });
                    done();
                });
        });

        it("returns an error when the request failed", function(done){
            seededError = "something went wrong";

            dataService
                .disable("888777")
                .then(null, (err) => {
                    expect(err).toBe("something went wrong");
                    done();
                });
        });

        it("returns an error when the http response code is not 200", function(done){
            seededResponse = {statusCode: 500};

            dataService
                .disable("555566")
                .then(null, (err) => {
                    expect(err).toBe("Invalid response Code");
                    done();
                });
        });
    })
});
