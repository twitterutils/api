var promise = require("the-promise-factory");
var rfr = require("rfr");

var dbConnectionFactory = rfr("lib/factories/dbConnection");
var userScheduleDataService = rfr("usergraph/lib/dal/userScheduleDataService");

var userChangesServiceFactory = rfr("usergraph/lib/factories/userChangesService")(
    rfr("usergraph/lib/services/userChangesService"),
    rfr("usergraph/lib/services/twitterGraphBuilder"),
    rfr("usergraph/lib/dal/twitterDataService"),

    rfr("usergraph/lib/dal/twitterGraphDataService"),
    dbConnectionFactory,

    rfr("usergraph/lib/services/changesStreamBuilder"),
    rfr("usergraph/lib/services/changesAnalyzer"),

    userScheduleDataService
);
var registeredUsersDataService = rfr("lib/dal/registeredUsersDataService")();
var changesBroadcastServiceFactory = rfr("usergraph/lib/factories/changesBroadcastService")(
    rfr("usergraph/lib/services/changesBroadcastService"),
    rfr("usergraph/lib/dal/twitterChangesDataService"),
    dbConnectionFactory
);

var crawler = rfr("usergraph/lib/services/crawler")(
    userChangesServiceFactory,
    registeredUsersDataService,
    userScheduleDataService(),
    changesBroadcastServiceFactory
);

module.exports = {
    run: function(){
        return promise.create((fulfill, reject) => {
            console.log("[USERGRAPHCRAWLER] crawling...");

            crawler
                .run()
                .then(() => {
                    console.log("[USERGRAPHCRAWLER] crawling complete");
                    fulfill();
                }, (err) => {
                    console.error(err);
                    reject(err);
                });
        });
    }
}