var rfr = require("rfr");
var twitterGraphDataService = rfr("usergraph/lib/dal/twitterGraphDataService");

describe("twitterGraphDataService", function(){
    it("requires a database", function(){
        expect(function(){
            twitterGraphDataService();
        }).toThrow(new Error("A database is required"));
    });

    var dataService = null;
    var collectionGraphStub = null;
    var collectionHistoryStub = null;

    beforeEach(function(){
        collectionGraphStub = {
            updateOne: function(){},
            findOne: function(){}
        };

        collectionHistoryStub = {
            insert: function(){}
        };

        var db = {
            collection: function(collectionName){
                if (collectionName === "crawler_twitter_graph"){
                    return collectionGraphStub;
                }

                if (collectionName === "crawler_twitter_graph_history"){
                    return collectionHistoryStub;
                }
            }
        };

        var invocation = 0;
        var currentDateSvc = () => {
            invocation++;
            return `now${invocation}`
        };

        dataService = twitterGraphDataService(db, currentDateSvc);
    });

    function getSampleGraph(){
        return {
            id: 1,
            graphId: "uniqueGraph",
            userName: "lolo",
            friends: [111, 222],
            followers: [444, 5555]
        };
    }

    it("inserts new values", function(done){
        spyOn(collectionGraphStub, "updateOne").and.callFake((criteria, value, options, callback) => {
            if (JSON.stringify(criteria) !== JSON.stringify({id: "1"}) ||
                JSON.stringify(options) !== JSON.stringify({upsert: true})) return;

            var expectedValue = {
                $set: {
                    id: "1",
                    graphId: "uniqueGraph",
                    userName: "lolo",
                    friends: ["111", "222"],
                    followers: ["444", "5555"],
                    version: 1.1,
                    modified_time_str: "now1"
                }
            };

            if (JSON.stringify(value) === JSON.stringify(expectedValue)){
                callback(null, {success: true});
            }
        });

        dataService.save(getSampleGraph())
            .then((result) => {
                expect(result).toEqual({success: true});
                done();
            });
    });

    it("fails when insertion fails", function(done){
        spyOn(collectionGraphStub, "updateOne").and.callFake((criteria, value, options, callback) => {
            callback("something went wrong");
        });

        dataService.save(getSampleGraph())
            .then(null, (error) => {
                expect(error).toBe("something went wrong");
                done();
            });
    });


    it("saves history", function(done){
        spyOn(collectionHistoryStub, "insert").and.callFake((value, callback) => {
            var expectedValue = {
                id: "1",
                graphId: "uniqueGraph",
                userName: "lolo",
                friends: ["111", "222"],
                followers: ["444", "5555"],
                version: 1.1,
                modified_time_str: "now1"
            };

            if (JSON.stringify(value) === JSON.stringify(expectedValue)){
                callback(null, {success: true});
                return;
            }
        });

        dataService.saveHistory(getSampleGraph())
            .then((result) => {
                expect(result).toEqual({success: true});
                done();
            });
    });

    it("fails when history cannot be saved", function(done){
        spyOn(collectionHistoryStub, "insert").and.callFake((value, callback) => {
            callback("something went wrong");
        });

        dataService.saveHistory(getSampleGraph())
            .then(null, (error) => {
                expect(error).toBe("something went wrong");
                done();
            });
    });

    it("finds previous twitter graphs", function(done){
        spyOn(collectionGraphStub, "findOne").and.callFake((criteria, callback) => {
            if (JSON.stringify(criteria) === JSON.stringify({id: "10"})){
                callback(null, {success: true});
            }
        });

        dataService.first(10)
            .then((result) => {
                expect(result).toEqual({success: true});
                done();
            });
    });

    it("fails when search fails", function(done){
        spyOn(collectionGraphStub, "findOne").and.callFake((criteria, callback) => {
            callback("something went wrong");
        });

        dataService.first(15)
            .then(null, (error) => {
                expect(error).toBe("something went wrong");
                done();
            });
    });
});
