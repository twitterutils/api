var rfr = require("rfr");
var notificationsDataService = rfr("notifications/lib/dal/notificationsDataService");

describe("notificationsDataService", function () {
    it("requires a database", function(){
        expect(function(){
            notificationsDataService();
        }).toThrow(new Error("A database is required"));
    });

    var dataService = null;
    var collectionStub = null;

    beforeEach(function(){
        collectionStub = {
            insert: function(){}
        };

        var db = {
            collection: function(collectionName){
                if (collectionName === "notifications_details"){
                    return collectionStub;
                }
            }
        };

        var invocation = 0;
        var currentDateSvc = () => {
            invocation++;
            return `now${invocation}`
        };

        dataService = notificationsDataService(db, currentDateSvc);
    });

    it("inserts new notifications", function(done){
        spyOn(collectionStub, "insert").and.callFake((value, callback) => {
            var expectedValue = {
                type: "unfollow",
                userId: "12345",
                details: {
                    target: "66667"
                },
                version: 1.0,
                creation_time_str: "now1"
            };

            if (JSON.stringify(value) === JSON.stringify(expectedValue)){
                callback(null, {success: true});
            }
        });

        dataService.save({
            type: "unfollow",
            userId: 12345,
            details: {
                target: "66667"
            }
        }).then((result) => {
            expect(result).toEqual({success: true});
            done();
        });
    });

    it("fails when insertion fails", function(done){
        spyOn(collectionStub, "insert").and.callFake((value, callback) => {
            callback("something went wrong");
        });

        dataService.save({userId: 11111})
            .then(null, (error) => {
                expect(error).toBe("something went wrong");
                done();
            });
    });
});