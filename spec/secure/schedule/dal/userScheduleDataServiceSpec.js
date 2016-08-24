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

        it("inserts new values", function(done){
            spyOn(collectionStub, "updateOne").and.callFake((criteria, value, options, callback) => {
                if (JSON.stringify(criteria) !== JSON.stringify({id: "55555"}) ||
                    JSON.stringify(options) !== JSON.stringify({upsert: true})) return;

                var expectedValue = {
                    $set: {
                        id: "55555",
                        field1: "value1",
                        field2: "value2",
                        version: 1.0,
                        modified_time_str: "now1"
                    }
                };


                var keysExpected = Object.keys(expectedValue["$set"]).sort();
                var keysActual = Object.keys(value["$set"]).sort();

                if (JSON.stringify(keysExpected) === JSON.stringify(keysActual)){
                    var objectsMatch = true;
                    keysExpected.forEach((k) => {
                        if (expectedValue["$set"][k] !== value["$set"][k]){
                            objectsMatch = false;
                        }
                    });

                    if (objectsMatch){
                        callback(null, {success: true});
                        return;
                    }
                }

                jasmine.getEnv().fail("invalid invocation");
            });

            dataService.update(55555, {field1: "value1", field2: "value2"})
                .then((result) => {
                    expect(result).toEqual({success: true});
                    done();
                });
        });
    })

    describe("read", function(){
        it("fails when read fails", function(done){
            spyOn(collectionStub, "findOne").and.callFake((criteria, callback) => {
                callback("something went wrong");
            });

            dataService.first(777777)
                .then(null, (error) => {
                    expect(error).toBe("something went wrong");
                    done();
                });
        });

        it("finds the user schedule", function(done){
            spyOn(collectionStub, "findOne").and.callFake((criteria, callback) => {
                if (JSON.stringify(criteria) === JSON.stringify({id: "10"})){
                    callback(null, {field1: 25});
                }
            });

            dataService.first(10)
                .then((result) => {
                    expect(result).toEqual({field1: 25});
                    done();
                });
        });
    })
})
