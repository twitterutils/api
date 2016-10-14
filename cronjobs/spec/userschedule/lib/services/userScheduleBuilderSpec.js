var rfr = require("rfr");
var promise = require("the-promise-factory");
var userScheduleBuilder = rfr("userschedule/lib/services/userScheduleBuilder");

describe("userScheduleBuilder", function () {
    var builder = null;

    var seededRegisteredUsers = null;
    var seededRegisteredUsersError = null;
    var registeredUsersDataServiceStub = null;

    var readScheduleUserIds = null;
    var seededReadResult = null;
    var seededReadError = null; 
    var userScheduleDataServiceStub = null;

    beforeEach(function(){
        process.env.TWU_CRON_MAX_USER_COUNT_PER_SCAN = "3";

        seededRegisteredUsers = [];
        seededRegisteredUsersError = null;
        registeredUsersDataServiceStub = {
            all: function(){
                return promise.create((fulfill, reject) => {
                    if (seededRegisteredUsersError) return reject(seededRegisteredUsersError);

                    fulfill(seededRegisteredUsers)
                });
            }
        };
        spyOn(registeredUsersDataServiceStub, "all").and.callThrough();

        readScheduleUserIds = [];
        seededReadResult = [];
        seededReadError = null;
        userScheduleDataServiceStub = {
            read: function(userIds){
                readScheduleUserIds.push(userIds);

                return promise.create((fulfill, reject) => {
                    if (seededReadError) return reject(seededReadError);

                    fulfill(seededReadResult)
                });
            }
        }

        builder = userScheduleBuilder(registeredUsersDataServiceStub, userScheduleDataServiceStub);
    });

    it ("retrieves the registered users", function(done){
        builder.build().then(() => {
            expect(registeredUsersDataServiceStub.all).toHaveBeenCalled();
            done();
        })
    });

    it ("fails when the registered users could not be read", function(done){
        seededRegisteredUsersError = "could not read users";

        builder.build().then(null, (err) => {
            expect(err).toBe("could not read users");
            done();
        })
    });

    it ("read the schedule for each of the registered users", function(done){
        seededRegisteredUsers = [
            {id: 1}, {id: "2"}, {id: 3}
        ];

        builder.build().then(() => {
            expect(readScheduleUserIds.length).toBe(1);
            expect(readScheduleUserIds[0]).toEqual([
                "1", "2", "3"
            ]);
            done();
        })
    })

    it ("fails when the schedules could not be read", function(done){
        seededReadError = "could not read schedules";

        builder.build().then(null, (err) => {
            expect(err).toBe("could not read schedules");
            done();
        })
    });

    it ("retrieves at most the number of specified users", function(done){
        seededReadResult = [
            {id: "1", readCount: 3},
            {id: "2", readCount: 4},
            {id: "3", readCount: 5},
            {id: "4", readCount: 6},
            {id: "5", readCount: 7}
        ];

        builder.build().then((userIds) => {
            expect(userIds).toEqual([
                "1", "2", "3"
            ]);
            done();
        })
    });

    it ("retrieves the users with the smallest read count", function(done){
        seededReadResult = [
            {id: "3", readCount: 5},
            {id: "1", readCount: 4},
            {id: "5", readCount: 7},
            {id: "4", readCount: 6},
            {id: "2", readCount: 4}
        ];

        builder.build().then((userIds) => {
            expect(userIds).toEqual([
                "1", "2", "3"
            ]);
            done();
        })
    })

    it ("retrieves the new users first", function(done){
        seededRegisteredUsers = [
            {id: 1},
            {id: 2},
            {id: 3},
            {id: 4},
            {id: 5},
            {id: 6}
        ];

        seededReadResult = [
            {id: "1", readCount: 4},
            {id: "2", readCount: 4},
            {id: "3", readCount: 5},
            {id: "4", readCount: 6},
            {id: "5", readCount: 7}
        ];

        builder.build().then((userIds) => {
            expect(userIds).toEqual([
                "6", "1", "2"
            ]);
            done();
        })
    })
})
