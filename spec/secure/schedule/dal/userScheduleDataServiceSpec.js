var rfr = require("rfr");
var promise = require("the-promise-factory");
var userScheduleDataService = rfr("secure/schedule/lib/dal/userScheduleDataService");

describe("userScheduleDataService", function() {
    it("requires a database", function(){
        expect(function(){
            userScheduleDataService();
        }).toThrow(new Error("A database is required"));
    });

    var dataService = null;
    var collectionStub = null;

    beforeEach(function(){
        collectionStub = {
            updateOne: function(){},
            findOne: function(){}
        };

        var db = {
            collection: function(collectionName){
                if (collectionName === "schedule_user_status"){
                    return collectionStub;
                }
            }
        };

        var invocation = 0;
        var currentDateSvc = () => {
            invocation++;
            return `now${invocation}`
        };

        dataService = userScheduleDataService(db, currentDateSvc);
    });

    describe("update", function(){
        it("fails when insertion fails", function(done){
            spyOn(collectionStub, "updateOne").and.callFake((criteria, value, options, callback) => {
                callback("something went wrong");
            });

            dataService.update(66666, {something: "most recent status"})
                .then(null, (error) => {
                    expect(error).toBe("something went wrong");
                    done();
                });
        })
    })
})
