var rfr = require("rfr");
var promise = require("the-promise-factory");
var userScheduleDataService = rfr("userschedule/lib/dal/userScheduleDataService");

describe("userScheduleDataService", function() {
    var dataService = null;
    var dbRequests = null;
    var seededError = null;
    var seededResult = null;

    it("requires a database", function(){
        expect(function(){
            userScheduleDataService();
        }).toThrow(new Error("A database is required"));
    });

    beforeEach(function(){
        dbRequests = [];
        seededError = null;
        seededResult = null;
        var collectionStub = {
            find: function(req){
                dbRequests.push(req);

                return {
                    toArray: function(){
                         return promise.create((fulfill, reject) => {
                            if (seededError){
                                reject(seededError);
                                return;
                            }

                            fulfill(seededResult);
                        });
                    }
                }
            }
        }

        var db = {
            collection: (collectionName) => {
                if (collectionName === "schedule_user_status"){
                    return collectionStub;
                }

                return jasmine.getEnv().fail("Invalid invocation");
            }
        }

        dataService = userScheduleDataService(db);
    })

    it("reads all user schedules", function(done){
        seededResult = ["something1", "something2"];

        dataService
            .read(["11111", "222222", 333333])
            .then((schedules) => {
                expect(dbRequests).toEqual([
                    {id: {$in: ["11111", "222222", "333333"]}}
                ]);
                expect(schedules).toEqual(seededResult);
                done();
            })
    });

    it ("fails when users could not be read", function(done){
        seededError = "something went wrong";

        dataService
            .read(["11111", "222222", 333333])
            .then(null, (err) => {
                expect(err).toBe("something went wrong");
                done();
            });
    })
})