var rfr = require("rfr");
var feedDataService = rfr("feedbuilder/lib/dal/feedDataService");

describe("feedDataService", function () {
    it("requires a database", function(){
        expect(function(){
            feedDataService();
        }).toThrow(new Error("A database is required"));
    });

    var dataService = null;

    var collectionStub = null;
    var seededError = null;
    var seededResult = null;

    beforeEach(function(){
        seededError = null;
        seededResult = null;
        collectionStub = {
            updateOne: function(){}
        };

        var db = {
            collection: function(collectionName){
                if (collectionName === "feed_list"){
                    return collectionStub;
                }
            }
        };

        var invocation = 0;
        var currentDateSvc = () => {
            invocation++;
            return `now${invocation}`
        };

        dataService = feedDataService(db, currentDateSvc);

        spyOn(console, "log");
    });

    describe("save", function(){
        it ("inserts feed for the give user", function(done){
            spyOn(collectionStub, "updateOne").and.callFake((criteria, value, options, callback) => {
                if (JSON.stringify(criteria) !== JSON.stringify({id: "55555"}) ||
                    JSON.stringify(options) !== JSON.stringify({upsert: true})) {
                    callback("invalid invocation", null);
                };

                var expectedValue = {
                    $set: {
                        id: "55555",
                        userName: "pepe",
                        items: [
                            "item1", "item2", "item3"
                        ],
                        version: 1.0,
                        modified_time_str: "now1"
                    }
                };

                if (JSON.stringify(value) === JSON.stringify(expectedValue)){
                    callback(null, {success: true});
                }
            });

            dataService.save(
                {id: 55555, userName: "pepe"},
                ["item1", "item2", "item3"]
            ).then((result) => {
                expect(result).toEqual({success: true});
                done();
            });
        });

        it("fails when insertion fails", function(done){
            spyOn(collectionStub, "updateOne").and.callFake((criteria, value, options, callback) => {
                callback("something went wrong");
            });

            dataService.save({id: 55555, userName: "pepe"}, [])
                .then(null, (error) => {
                    expect(error).toBe("something went wrong");
                    done();
                });
        });
    });
})