var rfr = require("rfr");
var promise = require("the-promise-factory");
var twitterGraphDataService = rfr("lib/dal/twitterGraphDataService");

describe("twitterGraphDataService", function(){
    it("requires a database", function(){
        expect(function(){
            twitterGraphDataService();
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
                if (tableName === "crawler_twitter_graph_history"){
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

        it("finds twitter graph with the specified id", function(done){
            seededResult = "seeded result";

            twitterGraphDataService(db)
                .first("my id")
                .then((result) => {
                    expect(dbRequests).toEqual([{ graphId: "my id" }]);
                    expect(result).toBe("seeded result");
                    done();
                });
        });

        it("calls the correct action when search fails", function(done){
            seededError = "seeded error";

            twitterGraphDataService(db)
                .first("my id")
                .then(() => {}, (err) => {
                    expect(dbRequests).toEqual([{ graphId: "my id" }]);
                    expect(err).toBe("seeded error");
                    done();
                });
        });
    });

    describe("graphsForUserCreatedAfter", function(){
        beforeEach(function(){
            collection = {
                find: function(req){
                    dbRequests.push(req);
                    return {
                        toArray: function(){
                             return promise.create((fulfill, reject) => {
                                if (seededError){
                                    reject(seededError);
                                    return;
                                }
                                
                                if (seededResult){
                                    fulfill(seededResult);
                                    return;
                                }

                                return jasmine.getEnv().fail("Invalid seeding");
                            });
                        }
                    };
                }
            };
        });

        it("finds the twitter graphs for the specified user created after the specified graph", function(done){
            seededResult = "seeded result";

            twitterGraphDataService(db)
                .graphsForUserCreatedAfter({
                    _id: "my bson id",
                    id: "twitter id"
                })
                .then((result) => {
                    expect(dbRequests).toEqual([
                        {id: "twitter id", _id: {$gt: "my bson id"}}
                    ]);
                    expect(result).toBe("seeded result");
                    done();
                });
        });

        it("calls the correct action when search fails", function(done){
            seededError = "seeded error";

            twitterGraphDataService(db)
                .graphsForUserCreatedAfter({
                    _id: "my bson id",
                    id: "twitter id"
                })
                .then(() => {}, (err) => {
                    expect(dbRequests).toEqual([
                        {id: "twitter id", _id: {$gt: "my bson id"}}
                    ]);
                    expect(err).toBe("seeded error");
                    done();
                });
        });
    });
});