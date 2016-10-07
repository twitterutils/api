var rfr = require("rfr");
var promise = require("the-promise-factory");
var upcomingScheduleDataService = rfr("userschedule/lib/dal/upcomingScheduleDataService");

describe("upcomingScheduleDataService", function () {
    var dataService = null;
    var removeInvocationCount = null;
    var seededDbClearError = null;
    var insertRequests = null;
    var seededDbInsertError = null;

    it("requires a database", function(){
        expect(function(){
            upcomingScheduleDataService();
        }).toThrow(new Error("A database is required"));
    });

    beforeEach(function(){
        removeInvocationCount = 0;
        seededDbClearError = null;

        insertRequests = [];
        seededDbInsertError = null;

        var collectionStub = {
            remove: function(){
                removeInvocationCount++;

                return promise.create((fulfill, reject) => {
                    if (seededDbClearError){
                        reject(seededDbClearError);
                        return;
                    }

                    fulfill();
                })
            },
            insert: function(request){
                insertRequests.push(request);

                return promise.create((fulfill, reject) => {
                    if (seededDbInsertError){
                        reject(seededDbInsertError);
                        return;
                    }

                    fulfill();
                })
            }
        }

        var db = {
            collection: (collectionName) => {
                if (collectionName === "schedule_upcoming_list"){
                    return collectionStub;
                }

                return jasmine.getEnv().fail("Invalid invocation");
            }
        }

        dataService = upcomingScheduleDataService(db);
    })

    describe("clear", function(){
        it ("deletes everything", function(done){
            dataService
                .clear()
                .then(() => {
                    expect(removeInvocationCount).toBe(1);
                    done();
                })
        })

        it ("fails on db error", function(done){
            seededDbClearError = "oh snap";

            dataService
                .clear()
                .then(null, (err) => {
                    expect(err).toBe("oh snap");
                    done();
                })
        })
    });

    describe("insert", function(){
        it ("inserts the specified ids", function(done){
            dataService
                .insert(["11111", 22222, "444444"])
                .then(() => {
                    expect(insertRequests.length).toBe(1);
                    expect(insertRequests[0]).toEqual([
                        {userId: "11111"},
                        {userId: "22222"},
                        {userId: "444444"}
                    ]);
                    done();
                })
        });

        it ("fails on db error", function(done){
            seededDbInsertError = "oh snap";

            dataService
                .insert(["1111", "6666"])
                .then(null, (err) => {
                    expect(err).toBe("oh snap");
                    done();
                })
        })
    })
})
