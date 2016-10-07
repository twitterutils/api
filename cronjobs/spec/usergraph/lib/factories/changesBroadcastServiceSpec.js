var rfr = require("rfr");
var promise = require("the-promise-factory");
var changesBroadcastServiceFactory = rfr("usergraph/lib/factories/changesBroadcastService");

describe("changesBroadcastServiceFactory", function() {
    var factory = null;
    var seededDb = null;
    var seededConnectionError = null;
    var seededChangesBroadcastService = {id: "the service"}; 

    beforeEach(function(){
        seededDb = null;
        seededConnectionError = null;
        var dbConnectionFactory = function(connectionName){
            if (connectionName !== "TWU_CRON_GRAPH_DB_CONNECTION_STRING"){
                throw new Error("invalid invocation");
            }

            return promise.create((fulfill, reject) => {
                if (seededConnectionError) return reject(seededConnectionError);
                return fulfill(seededDb);
            });
        };

        var seededTwitterChangesDataService = {id: "seeded data service"};
        var twitterChangesDataService = function(db){
            if (db === seededDb) return seededTwitterChangesDataService;
            return jasmine.getEnv().fail("invalid invocation");
        };

        var changesBroadcastService = function(dataService){
            if (dataService === seededTwitterChangesDataService) return seededChangesBroadcastService;
            return jasmine.getEnv().fail("invalid invocation");
        };

        factory = changesBroadcastServiceFactory(
            changesBroadcastService,
            twitterChangesDataService,
            dbConnectionFactory
        );
    });

    it("creates the service", function(done){
        seededDb = "this is a db";

        factory.create()
            .then((service) => {
                expect(service).toEqual(seededChangesBroadcastService);
                done();
            });
    });

    it("fails on dbConnection error", function(done){
        seededConnectionError = "db connection error";

        factory.create()
            .then(null, (error) => {
                expect(error).toBe("db connection error");
                done();
            });
    });
});