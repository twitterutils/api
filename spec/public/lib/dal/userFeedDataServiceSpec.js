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
        var db = {
            collection: function(collectionName){
                if (collectionName === "feed_list") {
                    return collection;
                }
            }
        };

        dbRequests = [];
        findSeededResult = {};
        findSeededError = null;
        var collection = {
            findOne: function(dbRequest){
                dbRequests.push(dbRequests);

                return {
                    then: (fulfill, reject) => {
                        if (findSeededError){
                            reject(findSeededError);
                            return;
                        }

                        fulfill(findSeededResult)
                    }
                };
            }
        };

        dataService = userFeedDataService(db);
    });

    
})