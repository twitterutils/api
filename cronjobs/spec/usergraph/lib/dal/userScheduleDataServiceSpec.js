var rfr = require("rfr");
var userScheduleDataService = rfr("usergraph/lib/dal/userScheduleDataService");

describe("userScheduleDataService", function() {
    var seededError = null;
    var seededResponse = null;
    var seededBody = null;
    var dataService = null;
    var requestJson = null;
    var requestStub = null;

    beforeEach(function(){
        process.env.TWU_CRON_SCHEDULE_API_BASE_URL = "mybaseurl";
        process.env.TWU_CRON_SCHEDULE_API_KEY = "apikey";

        seededError = null;
        seededResponse = null;
        seededBody = null;
        dataService = null;
        requestJson = null;
        requestStub = null;

        var localRequestStub = function(reqParams, callback){
            return requestStub(reqParams, callback);
        };

        dataService = userScheduleDataService(localRequestStub);

        spyOn(console, "log")
    });

    describe("update", function(){
        beforeEach(function(){
            requestStub = function(reqParams, callback){
                if (reqParams.method === "POST" &&
                    reqParams.headers.Authorization === "apikey" &&
                    reqParams.headers["Content-Type"] === "application/json" &&
                    reqParams.url === "mybaseurl/secure/schedule/api/v1/updateuser/"){
                    requestJson = reqParams.json;
                    callback(seededError, seededResponse, seededBody);
                    return;
                }

                jasmine.getEnv().fail("invalid invocation");
            };
        })

        it ("sends the user details", function(done){
            seededResponse = {statusCode: 200};
            seededBody = {success: true};

            dataService
                .update(111111)
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
                .update("888777")
                .then(null, (err) => {
                    expect(err).toBe("something went wrong");
                    done();
                });
        });

        it("returns an error when the http response code is not 200", function(done){
            seededResponse = {statusCode: 500};

            dataService
                .update("555566")
                .then(null, (err) => {
                    expect(err).toBe("Invalid response Code 500");
                    done();
                });
        });
    })

    describe("read", function(){
        beforeEach(function(){
            requestStub = function(reqParams, callback){
                if (reqParams.headers.Authorization === "apikey" &&
                    reqParams.url === "mybaseurl/secure/schedule/api/v1/list/"){
                    callback(seededError, seededResponse, seededBody);
                    return;
                }

                jasmine.getEnv().fail("invalid invocation");
            };
        });

        it ("returns all the user ids", function(done){
            seededResponse = {statusCode: 200};
            seededBody = '["11111", "2333333"]';

            dataService
                .read()
                .then((result) => {
                    expect(result).toEqual(["11111", "2333333"]);
                    done();
                });
        });

        it("returns an error when the request failed", function(done){
            seededError = "something went wrong";

            dataService
                .read()
                .then(null, (err) => {
                    expect(err).toBe("something went wrong");
                    done();
                });
        });

        it("returns an error when the http response code is not 200", function(done){
            seededResponse = {statusCode: 500};

            dataService
                .read()
                .then(null, (err) => {
                    expect(err).toBe("Invalid response Code 500");
                    done();
                });
        });
    })
});