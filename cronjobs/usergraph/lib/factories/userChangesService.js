var rfr = require("rfr");
var promise = require("the-promise-factory");
var dataServiceFactory = rfr("lib/factories/dataServiceFactory");

module.exports = function(
    userChangesServiceFn,

    twittterGraphBuilderFn,
    twitterDataServiceFn,

    twitterGraphDataServiceFn,
    dbConnectionFn,

    changesStreamBuilderFn,
    changesAnalyzerFn,

    userScheduleDataServiceFn){
    return {
        create: function(){
            return dataServiceFactory(dbConnectionFn)
                .create("TWU_CRON_GRAPH_DB_CONNECTION_STRING", (db) => {
                    var twitterDataService = twitterDataServiceFn();
                    var twittterGraphBuilder = twittterGraphBuilderFn(twitterDataService);

                    var twitterGraphDataService = twitterGraphDataServiceFn(db);

                    var changesAnalyzer = changesAnalyzerFn();
                    var changesStreamBuilder = changesStreamBuilderFn(changesAnalyzer);

                    var userScheduleDataService = userScheduleDataServiceFn();

                    return userChangesServiceFn(
                        twittterGraphBuilder,
                        twitterGraphDataService,
                        changesStreamBuilder,
                        userScheduleDataService
                    );
                });
        }
    }
}