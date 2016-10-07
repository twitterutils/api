var rfr = require("rfr");
var promise = require("the-promise-factory");
var userSchedule = rfr("userschedule/lib/services/userSchedule");

describe("userschedule", function () {
    var service = null;

    var factory = null;
    var seededCreateError = null;

    var userScheduleUpdaterStub = null;
    var seededUpdateError = null;

    beforeEach(function(){
        seededUpdateError = null;
        userScheduleUpdaterStub = {
            update: () => {
                return promise.create((fulfill, reject) => {
                    if (seededUpdateError){
                        reject(seededUpdateError);
                        return;
                    }

                    fulfill();
                });
            }
        };
        spyOn(userScheduleUpdaterStub, "update").and.callThrough();

        seededCreateError = null;
        factory = {
            create: () => {
                return promise.create((fulfill, reject) => {
                    if (seededCreateError){
                        reject(seededCreateError);
                        return;
                    }

                    fulfill(userScheduleUpdaterStub);
                });
            }
        }
        spyOn(factory, "create").and.callThrough();

        service = userSchedule(factory);
    })

    it("creates the userScheduleUpdater", function(done){
        service
            .run()
            .then(() => {
                expect(factory.create).toHaveBeenCalled();
                done();
            });
    })

    it("fails when the userScheduleUpdater could not be created", function(done){
        seededCreateError = "cannot create service";

        service
            .run()
            .then(null, (err) => {
                expect(err).toBe("cannot create service");
                done();
            })
    })

    it ("udpates the user schedule", function(done){
        service
            .run()
            .then(() => {
                expect(userScheduleUpdaterStub.update).toHaveBeenCalled();
                done();
            });
    })

    it("fails when the user schedule could not be updated", function(done){
        seededUpdateError = "cannot update schedule";

        service
            .run()
            .then(null, (err) => {
                expect(err).toBe("cannot update schedule");
                done();
            })
    })
})
