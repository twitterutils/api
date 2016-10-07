var rfr = require("rfr");
var promise = require("the-promise-factory");
var usernameDataService = rfr("username/lib/dal/usernameDataService");

describe("usernameDataService", function() {
    it("requires a database", function(){
        expect(function(){
            usernameDataService();
        }).toThrow(new Error("A database is required"));
    });

    var dataService = null;

    var collectionStub = null;
    var seededError = null;
    var seededResult = null;

    beforeEach(function(){
        seededError = null;
        seededResult = null;
        collectionStub = {};

        var db = {
            collection: function(collectionName){
                if (collectionName === "usernames_list"){
                    return collectionStub;
                }
            }
        };

        var invocation = 0;
        var currentDateSvc = () => {
            invocation++;
            return `now${invocation}`
        };

        dataService = usernameDataService(db, currentDateSvc);

        spyOn(console, "log");
    });

    describe("all", function(){
        beforeEach(function(){
            collectionStub.find = function(){
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
            };
        });

        it ("returns all the existing usernames", function(done){
            seededResult = [
                {id: "2222", userName: "pepe"},
                {id: "3333", userName: "lolo"},
                {id: "5555", userName: "josh"}
            ];

            dataService.all().then((result) => {
                expect(result).toEqual([
                    {id: "2222", userName: "pepe"},
                    {id: "3333", userName: "lolo"},
                    {id: "5555", userName: "josh"}
                ]);
                done();
            });
        });

        it ("fails on error", function(done){
            seededError = "could not read usernames";

            dataService.all().then(null, (err) => {
                expect(err).toBe("could not read usernames");
                done();
            });
        })
    });

    describe("save", function(){
        beforeEach(function(){
            collectionStub.insert = function(){};
        });

        it("inserts new usernames", function(done){
            spyOn(collectionStub, "insert").and.callFake((value, callback) => {
                var expectedValue = {
                    id: "12345",
                    userName: "lolo",
                    version: 1.0,
                    creation_time_str: "now1"
                };

                if (JSON.stringify(value) === JSON.stringify(expectedValue)){
                    callback(null, {success: true});
                }
            });

            dataService.save({
                id: 12345,
                name: "lolo"
            }).then((result) => {
                expect(result).toEqual({success: true});
                done();
            });
        });

        it("fails when insertion fails", function(done){
            spyOn(collectionStub, "insert").and.callFake((value, callback) => {
                callback("something went wrong");
            });

            dataService.save({id: 12345})
                .then(null, (error) => {
                    expect(error).toBe("something went wrong");
                    done();
                });
        });
    })
});