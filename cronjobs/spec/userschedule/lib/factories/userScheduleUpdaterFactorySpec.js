var rfr = require("rfr");
var promise = require("the-promise-factory");
var userScheduleUpdaterFactory = rfr("userschedule/lib/factories/userScheduleUpdaterFactory");

describe("userScheduleUpdaterFactory", function() {
    var factory = null;

    var userScheduleUpdater = "the user schedule updater";

    var userScheduleDataService = "the user schedule data service";
    var userScheduleDataServiceFactoryStub = null;
    var seededUserScheduleCreateError = null;

    var upcomingScheduleDataService = "the upcoming schedule data service";
    var upcomingScheduleDataServiceFactoryStub = null;
    var seededUpcomingScheduleCreateError = null;

    beforeEach(function(){
        seededUserScheduleCreateError = null;
        userScheduleDataServiceFactoryStub = {
            create: function(){
                return promise.create((fulfill, reject) => {
                    if (seededUserScheduleCreateError){
                        reject(seededUserScheduleCreateError);
                    }

                    fulfill(userScheduleDataService)
                })
            }
        }
        spyOn(userScheduleDataServiceFactoryStub, "create").and.callThrough();

        var userScheduleDataServiceFn = () => {return "b1";};
        var dbConnectionFn = () => {return "b2";};
        var userScheduleDataServiceFactoryFn = function(f1, f2){
            if (f1 !== userScheduleDataServiceFn) return jasmine.getEnv().fail("invalid invocation");
            if (f2 !== dbConnectionFn) return jasmine.getEnv().fail("invalid invocation");

            return userScheduleDataServiceFactoryStub;
        }

        seededUpcomingScheduleCreateError = null;
        upcomingScheduleDataServiceFactoryStub = {
            create: function(){
                return promise.create((fulfill, reject) => {
                    if (seededUpcomingScheduleCreateError){
                        reject(seededUpcomingScheduleCreateError);
                    }

                    fulfill(upcomingScheduleDataService)
                })
            }
        }
        spyOn(upcomingScheduleDataServiceFactoryStub, "create").and.callThrough();

        var upcomingScheduleDataServiceFn = () => {return "b3";}
        upcomingScheduleDataServiceFactoryFn = function(f1, f2){
            if (f1 !== upcomingScheduleDataServiceFn) return jasmine.getEnv().fail("invalid invocation");
            if (f2 !== dbConnectionFn) return jasmine.getEnv().fail("invalid invocation");

            return upcomingScheduleDataServiceFactoryStub;
        }

        var registeredUsersDataService = "the registered users data service";
        var registeredUsersDataServiceFn = () => {
            return registeredUsersDataService;
        }

        var userScheduleBuilder = "the user schedule builder";
        var userScheduleBuilderFn = (p1, p2) => {
            if (p1 !== registeredUsersDataService) return jasmine.getEnv().fail("invalid invocation");
            if (p2 != userScheduleDataService) return jasmine.getEnv().fail("invalid invocation");

            return userScheduleBuilder;
        }

        var userScheduleUpdaterFn = function(p1, p2){
            if (p1 !== userScheduleBuilder) return jasmine.getEnv().fail("invalid invocation");
            if (p2 !== upcomingScheduleDataService) return jasmine.getEnv().fail("invalid invocation");

            return userScheduleUpdater;
        }

        factory = userScheduleUpdaterFactory(
            userScheduleUpdaterFn,
            userScheduleBuilderFn, 
            registeredUsersDataServiceFn, 
            userScheduleDataServiceFactoryFn,
            userScheduleDataServiceFn, dbConnectionFn,
            upcomingScheduleDataServiceFactoryFn, upcomingScheduleDataServiceFn
        ); 
    })

    it ("creates the userScheduleDataService", function(done){
        factory.create().then(() => {
            expect(userScheduleDataServiceFactoryStub.create).toHaveBeenCalled();
            done();
        })
    })

    it ("fails when the userScheduleDataService could not be created", function(done){
        seededUserScheduleCreateError = "something crapped out";

        factory.create().then(null, (err) => {
            expect(err).toBe("something crapped out");
            done();
        })
    })

    it ("creates the upcomingScheduleDataService", function(done){
        factory.create().then(() => {
            expect(upcomingScheduleDataServiceFactoryStub.create).toHaveBeenCalled();
            done();
        })
    })

    it ("fails when the upcomingScheduleDataService could not be created", function(done){
        seededUpcomingScheduleCreateError = "something crapped out";

        factory.create().then(null, (err) => {
            expect(err).toBe("something crapped out");
            done();
        })
    })

    it ("creates the correct result", function(done){
        factory.create().then((result) => {
            expect(result).toBe(userScheduleUpdater);
            done();
        })
    })
})
