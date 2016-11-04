var rfr = require("rfr");
var graphDataService = rfr("lib/dal/graphDataService");

describe("graphDataService", function() {
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
            }
        };

        dataService = graphDataService(requestStub);
    });

    describe("userDetails", function(){
        beforeEach(function(){
            expectedApiUrl = "mybaseurl/secure/graph/api/v1/user/myuserid/"
        });

        it("returns an error when the http response code is not 200", function(done){
            seededResponse = {statusCode: 500};

            dataService
                .userDetails("myuserid")
                .then(null, (err) => {
                    expect(err).toBe("Invalid response Code 500");
                    done();
                });
        });

        it("returns an error when the request failed", function(done){
            seededError = "something went wrong";

            dataService
                .userDetails("myuserid")
                .then(null, (err) => {
                    expect(err).toBe("something went wrong");
                    done();
                });
        });

        it("parses the response body", function(done){
            seededResponse = {statusCode: 200};
            seededBody = '{"id":"29893096","graphId":"330be5d0-2cfb-11e6-9d6f-9794a86873ad","userName":"camilin87","friends":[241007239,3108404203,9526722],"followers":[17769779,1933042237]}';

            dataService
                .userDetails("myuserid")
                .then((results) => {
                    expect(results).toEqual({
                        id:"29893096",
                        graphId:"330be5d0-2cfb-11e6-9d6f-9794a86873ad",
                        userName:"camilin87",
                        friends:[241007239,3108404203,9526722],
                        followers:[17769779,1933042237]
                    });
                    done();
                });
        });
    });

    describe("userChanges", function(){
        beforeEach(function(){
            expectedApiUrl = "mybaseurl/secure/graph/api/v1/changes/myuserid/"
        });

        it("returns an error when the http response code is not 200", function(done){
            seededResponse = {statusCode: 500};

            dataService
                .userChanges("myuserid")
                .then(null, (err) => {
                    expect(err).toBe("Invalid response Code 500");
                    done();
                });
        });

        it("returns an error when the request failed", function(done){
            seededError = "something went wrong";

            dataService
                .userChanges("myuserid")
                .then(null, (err) => {
                    expect(err).toBe("something went wrong");
                    done();
                });
        });

        it("parses the response body", function(done){
            seededResponse = {statusCode: 200};
            seededBody = '[{"type":"friend","originator":"29893096","target":9526722,"prevId":"e62feea0-1bcf-11e6-926c-67cf9ffda0f3","currId":"c9b9bfc0-1bd0-11e6-8f45-21b880019bcc"},{"type":"follow","originator":2252762718,"target":"29893096","prevId":"c9b9bfc0-1bd0-11e6-8f45-21b880019bcc","currId":"5f3609d0-1c05-11e6-b694-7149e79175e6"}]';

            dataService
                .userChanges("myuserid")
                .then((results) => {
                    expect(results).toEqual([
                        {
                            type:"friend",
                            originator:"29893096",
                            target:9526722,
                            prevId:"e62feea0-1bcf-11e6-926c-67cf9ffda0f3",
                            currId:"c9b9bfc0-1bd0-11e6-8f45-21b880019bcc"
                        },
                        {
                            type:"follow",
                            originator:2252762718,
                            target:"29893096",
                            prevId:"c9b9bfc0-1bd0-11e6-8f45-21b880019bcc",
                            currId:"5f3609d0-1c05-11e6-b694-7149e79175e6"
                        }
                    ]);
                    done();
                });
        });
    });
    
    describe("recentChanges", function(){
        beforeEach(function(){
            expectedApiUrl = "mybaseurl/secure/graph/api/v1/recentchanges/mygraphid/"
        });

        it("returns an error when the http response code is not 200", function(done){
            seededResponse = {statusCode: 500};

            dataService
                .recentChanges("mygraphid")
                .then(null, (err) => {
                    expect(err).toBe("Invalid response Code 500");
                    done();
                });
        });

        it("returns an error when the request failed", function(done){
            seededError = "something went wrong";

            dataService
                .recentChanges("mygraphid")
                .then(null, (err) => {
                    expect(err).toBe("something went wrong");
                    done();
                });
        });

        it("parses the response body", function(done){
            seededResponse = {statusCode: 200};
            seededBody = '[{"type":"friend","originator":"29893096","target":9526722,"prevId":"e62feea0-1bcf-11e6-926c-67cf9ffda0f3","currId":"c9b9bfc0-1bd0-11e6-8f45-21b880019bcc"},{"type":"follow","originator":2252762718,"target":"29893096","prevId":"c9b9bfc0-1bd0-11e6-8f45-21b880019bcc","currId":"5f3609d0-1c05-11e6-b694-7149e79175e6"}]';

            dataService
                .recentChanges("mygraphid")
                .then((results) => {
                    expect(results).toEqual([
                        {
                            type:"friend",
                            originator:"29893096",
                            target:9526722,
                            prevId:"e62feea0-1bcf-11e6-926c-67cf9ffda0f3",
                            currId:"c9b9bfc0-1bd0-11e6-8f45-21b880019bcc"
                        },
                        {
                            type:"follow",
                            originator:2252762718,
                            target:"29893096",
                            prevId:"c9b9bfc0-1bd0-11e6-8f45-21b880019bcc",
                            currId:"5f3609d0-1c05-11e6-b694-7149e79175e6"
                        }
                    ]);
                    done();
                });
        });
    });
});
