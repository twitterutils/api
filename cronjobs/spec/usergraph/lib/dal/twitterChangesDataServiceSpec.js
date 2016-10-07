var rfr = require("rfr");
var twitterChangesDataService = rfr("usergraph/lib/dal/twitterChangesDataService");

describe("twitterChangesDataService", function() {
    it("requires a database", function(){
        expect(function(){
            twitterChangesDataService();
        }).toThrow(new Error("A database is required"));
    });

    var dataService = null;
    var collectionStub = null;

    beforeEach(function(){
        collectionStub = {
            insert: function(){}
        };

        var db = {
            collection: function(collectionName){
                if (collectionName === "crawler_twitter_changes"){
                    return collectionStub;
                }
            }
        };

        var invocation = 0;
        var currentDateSvc = () => {
            invocation++;
            return `now${invocation}`
        };

        dataService = twitterChangesDataService(db, currentDateSvc);

        spyOn(console, "log");
    });

    function getSampleChange(){
        return {
            type: "changeType",
            originator: 5,
            target: 6,
            prevId: 7,
            currId: 8
        };
    }

    it("inserts new values", function(done){
        spyOn(collectionStub, "insert").and.callFake((value, callback) => {
            var expectedValue = {
                type: "changeType",
                originator: "5",
                target: "6",
                prevId: 7,
                currId: 8,
                version: 1.0,
                modified_time_str: "now1"
            };

            if (JSON.stringify(value) === JSON.stringify(expectedValue)){
                callback(null, {success: true});
            }
        });

        dataService.save(getSampleChange())
            .then((result) => {
                expect(result).toEqual({success: true});
                done();
            });
    });

    it("fails when insertion fails", function(done){
        spyOn(collectionStub, "insert").and.callFake((value, callback) => {
            callback("something went wrong");
        });

        dataService.save(getSampleChange())
            .then(null, (error) => {
                expect(error).toBe("something went wrong");
                done();
            });
    });
});