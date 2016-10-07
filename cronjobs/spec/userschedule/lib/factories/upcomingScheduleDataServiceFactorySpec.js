var rfr = require("rfr");
var promise = require("the-promise-factory");
var upcomingScheduleDataServiceFactory = rfr("userschedule/lib/factories/upcomingScheduleDataServiceFactory");

describe("upcomingScheduleDataServiceFactory", function() {
    var factory = null;
    var seededDbError = null;
    var dataService = {name: "the data service"};

    beforeEach(function(){
        var db = "the database";
        seededDbError = null;

        var dbConnectionFactory = function(connStr) {
            if (connStr !== "TWU_CRON_SCHEDULE_DB_CONNECTION_STRING"){
                return jasmine.getEnv().fail("Invalid invocation");
            }

            return promise.create((fulfill, reject) => {
                if (seededDbError){
                    reject(seededDbError);
                }

                fulfill(db);
            })
        };

        var upcomingScheduleDataServiceFn = function(pDb){
            if (pDb !== db){
                return jasmine.getEnv().fail("Invalid invocation");
            }

            return dataService;
        }

        factory = upcomingScheduleDataServiceFactory(
            upcomingScheduleDataServiceFn,
            dbConnectionFactory
        );
    });

    it("creates the service", function(done){
        factory
            .create()
            .then((svc) => {
                expect(svc).toBe(dataService);
                done();
            })
    });

    it("fails when the db connection failed", function(done){
        seededDbError = "oh crap, the db is down";

        factory
            .create()
            .then(null, (err) => {
                expect(err).toBe("oh crap, the db is down");
                done();
            })
    })
})