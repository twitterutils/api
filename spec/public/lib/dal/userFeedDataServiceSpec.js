var rfr = require("rfr");
var userFeedDataService = rfr("public/lib/dal/userFeedDataService");


describe("userFeedDataService", function(){
    it("requires a database", function(){
        expect(function(){
            userFeedDataService();
        }).toThrow(new Error("A database is required"));
    });

    var dbRequests = null;
    var findSeededResult = null;
    var findSeededError = null;

    var dataService = null;

    beforeEach(function(){
        dbRequests = [];
        findSeededResult = {};
        findSeededError = null;

        var db = {
            collection: function(collectionName){
                if (collectionName !== "feed_list") {
                    return jasmine.getEnv().fail("invalid invocation");
                }

                return {
                    findOne: function(dbRequest, callback){
                        dbRequests.push(dbRequest);
                        callback(findSeededError, findSeededResult);
                    }
                }
            }
        };

        dataService = userFeedDataService(db);
    });

    it ("fails on db failure", function(done){
        findSeededError = "db error";

        dataService
            .read("pepitin")
            .then(null, (err) => {
                expect(err).toBe(findSeededError);
                done();
            });
    });

    it ("reads the correct feed", function(done){
        dataService
            .read("pepiTin")
            .then(() => {
                expect(dbRequests).toEqual([
                    {userName: /^pepiTin$/i}
                ]);
                done();
            });
    });

    it ("returns the items from the feed", function(done){
        findSeededResult = {
            items: ["item1", "item2"]
        };

        dataService
            .read("pepitin")
            .then((result) => {
                expect(result).toEqual(["item1", "item2"]);
                done();
            });
    });
})