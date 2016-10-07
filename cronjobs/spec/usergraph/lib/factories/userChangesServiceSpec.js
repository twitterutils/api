var rfr = require("rfr");
var promise = require("the-promise-factory");
var userChangesServiceFactory = rfr("usergraph/lib/factories/userChangesService");

describe("userChangesServiceFactory", function(){
    var factory = null;
    var seededDb = null;
    var seededConnectionError = null;
    var seededUserChangesService = {name: "userChangesService"};

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

        var seededChangesAnalyzer = {name: "changesAnalyzer"};
        var changesAnalyzerFactory = function(){
            return seededChangesAnalyzer;
        };

        var seededChangesStreamBuilder = {name: "changesStreamBuilder"};
        var changesStreamBuilderFactory = function(changesAnalyzer){
            if (changesAnalyzer !== seededChangesAnalyzer) return jasmine.getEnv().fail("invalid invocation");
            return seededChangesStreamBuilder;
        };

        var seededTwitterDataService = {name: "twitterDataService"};
        var twitterDataServiceFactory = function(){
            return seededTwitterDataService;
        };

        var seededTwitterGraphBuilder = {name: "twitterGraphBuilder"};
        var twittterGraphBuilderFactory = function(twitterDataService){
            if (twitterDataService !== seededTwitterDataService) return jasmine.getEnv().fail("invalid invocation");
            return seededTwitterGraphBuilder;
        };

        var seededTwitterGraphDataService = {name: "twitterGraphDataService"};
        var twitterGraphDataServiceFactory = function(db){
            if (db !== seededDb) return jasmine.getEnv().fail("invalid invocation");
            return seededTwitterGraphDataService;
        };

        var seededUserScheduleDataService = {name: "userScheduleDataService"};
        var userScheduleDataServiceFactory = function(){
            return seededUserScheduleDataService;
        }

        var userChangesService = function(
            twitterGraphBuilder, twitterGraphDataService, changesStreamBuilder){
            if (twitterGraphBuilder !== seededTwitterGraphBuilder) return jasmine.getEnv().fail("invalid invocation");
            if (twitterGraphDataService !== seededTwitterGraphDataService) return jasmine.getEnv().fail("invalid invocation");
            if (changesStreamBuilder !== seededChangesStreamBuilder) return jasmine.getEnv().fail("invalid invocation");

            return seededUserChangesService;
        };

        factory = userChangesServiceFactory(
            userChangesService,

            twittterGraphBuilderFactory,
            twitterDataServiceFactory,

            twitterGraphDataServiceFactory,
            dbConnectionFactory,

            changesStreamBuilderFactory,
            changesAnalyzerFactory,

            userScheduleDataServiceFactory
        );
    });

    it("fails on dbConnection error", function(done){
        seededConnectionError = "db connection error";

        factory.create()
            .then(null, (error) => {
                expect(error).toBe("db connection error");
                done();
            });
    });

    it("creates the userChangesService", function(done){
        seededDb = "this is a db";

        factory.create()
            .then((service) => {
                expect(service).toBe(seededUserChangesService);
                done();
            });
    });
});