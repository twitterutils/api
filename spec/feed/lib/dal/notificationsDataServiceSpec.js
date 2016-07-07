var rfr = require("rfr");
var notificationsDataService = rfr("feed/lib/dal/notificationsDataService");

describe("notificationsDataService", function () {
    it("requires a database", function(){
        expect(function(){
            notificationsDataService();
        }).toThrow(new Error("A database is required"));
    });

    var db = null;
    var dbRequests = null;

    beforeEach(function(){
        dbRequests = [];
        db = {
            collection: function(collectionName){
                if (collectionName === "notifications_details") {
                    return {
                        find: function(dbRequest){
                            return {
                                limit: function(count){
                                    dbRequests.push({
                                        userId: dbRequest.userId,
                                        count: count
                                    });
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
    });
});