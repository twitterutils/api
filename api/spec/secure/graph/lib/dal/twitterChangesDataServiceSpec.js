var rfr = require("rfr");
var promise = require("the-promise-factory");
var twitterChangesDataService = rfr("secure/graph/lib/dal/twitterChangesDataService");

describe("twitterChangesDataService", function(){
    it("requires a database", function(){
        expect(function(){
            twitterChangesDataService();
        }).toThrow(new Error("A database is required"));
    });

    var dbRequests = null;
    var db = null;
    var seededError = null;
    var seededResult = null;

    beforeEach(function(){
        seededError = null;
        seededResult = null;
        dbRequests = [];

        db = {
            collection: function(tableName){
                if (tableName === "crawler_twitter_changes"){
                    return {
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
                            }
                        }
                    };
                }
            }
        };
    });

    describe("changesFor twitterId", function(){
        it("finds changes", function(done){
            seededResult = "seeded result";

            twitterChangesDataService(db)
                .changesFor(55555)
                .then((result) => {
                    expect(dbRequests).toEqual([
                        {$or: [{target: "55555"}, {originator: "55555"}]}
                    ]);
                    expect(result).toBe("seeded result");
                    done();
                });
        });

        it("calls the correct action when search fails", function(done){
            seededError = "seeded error";

            twitterChangesDataService(db)
                .changesFor(55555)
                .then(() => {}, (err) => {
                    expect(dbRequests).toEqual([
                        {$or: [{target: "55555"}, {originator: "55555"}]}
                    ]);
                    expect(err).toBe("seeded error");
                    done();
                });
        });
    });

    describe("changesFor twitterId and graphIds", function(){
        it("finds changes", function(done){
            seededResult = "seeded result";

            twitterChangesDataService(db)
                .changesFor("my id", ["graph1", "graph2"])
                .then((result) => {
                    expect(dbRequests).toEqual([
                        {
                            $or: [{target: "my id"}, {originator: "my id"}],
                            currId: {$in: ["graph1", "graph2"]}
                        }
                    ]);
                    expect(result).toBe("seeded result");
                    done();
                });
        });

        it("calls the correct action when search fails", function(done){
            seededError = "seeded error";

            twitterChangesDataService(db)
                .changesFor("my id", ["graph1", "graph2"])
                .then(() => {}, (err) => {
                    expect(dbRequests).toEqual([
                        {
                            $or: [{target: "my id"}, {originator: "my id"}],
                            currId: {$in: ["graph1", "graph2"]}
                        }
                    ]);
                    expect(err).toBe("seeded error");
                    done();
                });
        });

        it("finds all the changes when no graphIds are provided", function(done){
            seededResult = "seeded result";

            twitterChangesDataService(db)
                .changesFor("my id", null)
                .then((result) => {
                    expect(dbRequests).toEqual([
                        {$or: [{target: "my id"}, {originator: "my id"}]}
                    ]);
                    expect(result).toBe("seeded result");
                    done();
                });
        });

        it("returns empty when graphIds is empty", function(done){
            seededResult = "seeded result";

            twitterChangesDataService(db)
                .changesFor("my id", [])
                .then((result) => {
                    expect(dbRequests).toEqual([
                        {
                            $or: [{target: "my id"}, {originator: "my id"}],
                            currId: {$in: []}
                        }
                    ]);
                    expect(result).toBe("seeded result");
                    done();
                });
        });
    });
});