var rfr = require("rfr");
var usernamesDataService = rfr("usernames/lib/dal/usernamesDataService");

describe("usernamesDataService", function(){
    it("requires a database", function(){
        expect(function(){
            usernamesDataService();
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
                if (tableName === "usernames_list"){
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
});