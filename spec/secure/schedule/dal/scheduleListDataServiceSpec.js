var rfr = require("rfr");
var promise = require("the-promise-factory");
var scheduleListDataService = rfr("secure/schedule/lib/dal/scheduleListDataService");

describe("scheduleListDataService", function () {
    it("requires a database", function(){
        expect(function(){
            scheduleListDataService();
        }).toThrow(new Error("A database is required"));
    });

    var dataService = null;
    var collectionStub = null;

    beforeEach(function(){
        collectionStub = {
            find: function(){}
        };

        var db = {
            collection: function(collectionName){
                if (collectionName === "schedule_upcoming_list"){
                    return collectionStub;
                }
            }
        };

        dataService = scheduleListDataService(db);
    });

    describe("all", function(){
        it ("reads all the records", function(done){
            spyOn(collectionStub, "find").and.callFake(() => {
                return {
                    toArray: () => {
                        return promise.create((fulfill, reject) => {
                            fulfill([
                                "111111",
                                "222222",
                                "333333"
                            ]);
                        });
                    }
                }
            });

            dataService.all().then((result) => {
                expect(result).toEqual([
                    "111111",
                    "222222",
                    "333333"
                ]);
                done();
            });
        });

        it ("fails when the information could not be read", function(done){
            spyOn(collectionStub, "find").and.callFake(() => {
                return {
                    toArray: () => {
                        return promise.create((fulfill, reject) => {
                            reject("could not read users");
                        });
                    }
                }
            });

            dataService.all().then(null, (err) => {
                expect(err).toBe("could not read users");
                done();
            });
        })
    })
})
