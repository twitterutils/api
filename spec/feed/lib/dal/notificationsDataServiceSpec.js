var rfr = require("rfr");
var promise = require("the-promise-factory");
var notificationsDataService = rfr("feed/lib/dal/notificationsDataService");

describe("notificationsDataService", function () {
    it("requires a database", function(){
        expect(function(){
            notificationsDataService();
        }).toThrow(new Error("A database is required"));
    });

    var db = null;
    var dbRequests = null;
    var seededDbResult = null;
    var seededDbError = null;

    beforeEach(function(){
        dbRequests = [];
        db = {
            collection: function(collectionName){
                if (collectionName === "notifications_details") {
                    return {
                        find: function(dbRequest){
                            return {
                                limit: function(count){
                                    return {
                                        toArray: function(){
                                            dbRequests.push({
                                                userId: dbRequest.userId,
                                                count: count
                                            });

                                            return promise.create((fulfill, reject) => {
                                                if (seededDbError) return reject(seededDbError);
                                                fulfill(seededDbResult);
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
    })

    describe("recentNotifications", function(){
        it ("finds the notifications for the user", function(done){
            notificationsDataService(db)
                .recentNotifications("333444", 10)
                .then(() => {
                    expect(dbRequests).toEqual([
                        {userId: "333444", count: 10}
                    ]);
                    done();
                });
        });

        it ("fails on db failure", function(done){
            seededDbError = "db error";

            notificationsDataService(db)
                .recentNotifications("333444", 10)
                .then(null, (err) => {
                    expect(err).toBe(seededDbError);
                    done();
                });
        })
    });
});