var rfr = require("rfr");
var promise = require("the-promise-factory");
var userScheduleUpdater = rfr("userschedule/lib/services/userScheduleUpdater");

describe("userScheduleUpdater", function() {
    var service = null;

    var userScheduleBuilderStub = null;
    var seededUserScheduleResult = null;
    var seededUserScheduleError = null;

    var upcomingScheduleDataServiceStub = null;
    var seededClearError = null;
    var seededInsertError = null;

    beforeEach(function(){
        seededUserScheduleResult = [];
        seededUserScheduleError = null;
        userScheduleBuilderStub = {
            build: function(){
                return promise.create((fulfill, reject) => {
                    if (seededUserScheduleError){
                        reject(seededUserScheduleError);
                        return;
                    }

                    fulfill(seededUserScheduleResult);
                });
            }
        };
        spyOn(userScheduleBuilderStub, "build").and.callThrough();

        seededClearError = null;
        upcomingScheduleDataServiceStub = {
            clear: function(){
                return promise.create((fulfill, reject) => {
                    if (seededClearError){
                        reject(seededClearError);
                        return;
                    }

                    fulfill();
                });
            },
            insert: function(userIds){
                return promise.create((fulfill, reject) => {
                    if (seededInsertError){
                        reject(seededInsertError);
                        return;
                    }

                    fulfill();
                });
            }
        }
        spyOn(upcomingScheduleDataServiceStub, "clear").and.callThrough();
        spyOn(upcomingScheduleDataServiceStub, "insert").and.callThrough();

        service = userScheduleUpdater(userScheduleBuilderStub, upcomingScheduleDataServiceStub);

        spyOn(console, "log");
    })

    it ("builds the upcoming schedule", function(done){
        service.update().then(() => {
            expect(userScheduleBuilderStub.build).toHaveBeenCalled();
            done();
        })
    })

    it ("fails when the schedule could not be build", function(done){
        seededUserScheduleError = "error building schedule";

        service.update().then(null, (err) => {
            expect(err).toBe("error building schedule");
            done();
        })
    })

    it ("clears the upcoming schedule", function(done){
        service.update().then(() => {
            expect(upcomingScheduleDataServiceStub.clear).toHaveBeenCalled();
            done();
        })
    })

    it ("fails when the upcoming schedule could not be cleared", function(done){
        seededClearError = "error clearing schedule";

        service.update().then(null, (err) => {
            expect(err).toBe("error clearing schedule");
            done();
        })
    })

    it ("inserts the newly calculated schedule", function(done){
        seededUserScheduleResult = ["3333", "4444", "5555"];

        service.update().then(() => {
            expect(upcomingScheduleDataServiceStub.insert).toHaveBeenCalledWith(
                ["3333", "4444", "5555"]
            );
            done();
        })
    })

    it ("fails when the upcoming schedule could not be updated", function(done){
        seededInsertError = "error updating schedule";

        service.update().then(null, (err) => {
            expect(err).toBe("error updating schedule");
            done();
        })
    })
});