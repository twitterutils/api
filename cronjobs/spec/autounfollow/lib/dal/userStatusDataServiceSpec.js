var rfr = require("rfr");
var userStatusDataService = rfr("autounfollow/lib/dal/userStatusDataService");

describe("userStatusDataService", function() {
    it("requires a database", function(){
        expect(function(){
            userStatusDataService();
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
                if (collectionName === "autounfollow_user_status"){
                    return collectionStub;
                }
            }
        };

        var invocation = 0;
        var currentDateSvc = () => {
            invocation++;
            return `now${invocation}`
        };

        dataService = userStatusDataService(db, currentDateSvc);
    });

    it("inserts new values", function(done){
        spyOn(collectionStub, "updateOne").and.callFake((criteria, value, options, callback) => {
            if (JSON.stringify(criteria) !== JSON.stringify({id: "55555"}) ||
                JSON.stringify(options) !== JSON.stringify({upsert: true})) return;

            var expectedValue = {
                $set: {
                    id: "55555",
                    graphId: "mostRecentGraphId",
                    version: 1.0,
                    modified_time_str: "now1"
                }
            };

            if (JSON.stringify(value) === JSON.stringify(expectedValue)){
                callback(null, {success: true});
            }
        });

        dataService.save(55555, "mostRecentGraphId")
            .then((result) => {
                expect(result).toEqual({success: true});
                done();
            });
    });

    it("fails when insertion fails", function(done){
        spyOn(collectionStub, "updateOne").and.callFake((criteria, value, options, callback) => {
            callback("something went wrong");
        });

        dataService.save(66666, "mostRecentGraphId")
            .then(null, (error) => {
                expect(error).toBe("something went wrong");
                done();
            });
    });

    it("finds the user status", function(done){
        spyOn(collectionStub, "findOne").and.callFake((criteria, callback) => {
            if (JSON.stringify(criteria) === JSON.stringify({id: "10"})){
                callback(null, {graphId: 25});
            }
        });

        dataService.first(10)
            .then((result) => {
                expect(result).toEqual({graphId: 25});
                done();
            });
    });

    it("fails when read fails", function(done){
        spyOn(collectionStub, "findOne").and.callFake((criteria, callback) => {
            callback("something went wrong");
        });

        dataService.first(777777, "mostRecentGraphId")
            .then(null, (error) => {
                expect(error).toBe("something went wrong");
                done();
            });
    });
});
