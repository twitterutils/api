var rfr = require("rfr");
var dataServiceFactory = rfr("lib/factories/dataServiceFactory");

module.exports = function(
    changesBroadcastServiceFn,
    twitterChangesDataServiceFn,
    dbConnectionFn){
    return {
        create: function(){
            return dataServiceFactory(dbConnectionFn)
                .create("TWU_CRON_GRAPH_DB_CONNECTION_STRING", (db) => {
                    var twitterChangesDataService = twitterChangesDataServiceFn(db);
                    return changesBroadcastServiceFn(twitterChangesDataService);
                });
        }
    };
}