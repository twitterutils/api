var rfr = require("rfr");
var promise = require("the-promise-factory");
var twitterUserDataService = rfr("lib/dal/twitterUserDataService");

describe("twitterUserDataService", function(){
    it("requires a database", function(){
        expect(function(){
            twitterUserDataService();
        }).toThrow(new Error("A database is required"));
    });

    var collection = null;
    var dbRequests = null;
    var db = null;
    var seededError = null;
    var seededResult = null;

    beforeEach(function(){
        collection = null;
        seededError = null;
        seededResult = null;
        dbRequests = [];

        db = {
            collection: function(tableName){
                if (tableName === "crawler_twitter_graph"){
                    return collection;
                }
            }
        };
    });

    describe("first", function(){
        beforeEach(function(){
            collection = {
                findOne: function(req, callback){
                    dbRequests.push(req);
                    callback(seededError, seededResult);
                }
            };
        });

        it("finds twitter user with the specified id", function(done){
            seededResult = "seeded result";

            twitterUserDataService(db)
                .first("my id")
                .then((result) => {
                    expect(dbRequests).toEqual([{ id: "my id" }]);
                    expect(result).toBe("seeded result");
                    done();
                });
        });

        it("calls the correct action when search fails", function(done){
            seededError = "seeded error";

            twitterUserDataService(db)
                .first("my id")
                .then(() => {}, (err) => {
                    expect(dbRequests).toEqual([{ id: "my id" }]);
                    expect(err).toBe("seeded error");
                    done();
                });
        });
    });
});