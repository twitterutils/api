var promise = require("the-promise-factory");
var async = require("async");

module.exports = function (
    dbConnectionFactory,
    usernameDataServiceFn,
    registeredUsersDataService,
    userIdsReader,
    userIdHelper) {
    return {
        build: function(){
            return promise.create((fulfill, reject) => {
                async.parallel({
                    dbIds: readDbIds,
                    allIds: readAllIds
                }, (err, result) => {
                    if (err) return reject(err);

                    var missingIds = userIdHelper.getMissingIds(result.allIds, result.dbIds);

                    console.log("userIdBatchBuilder.missingIds", missingIds);

                    var batches = userIdHelper.buildBatches(missingIds, 100);

                    console.log("userIdBatchBuilder.build.completed", "resultLength=", (batches || []).length);

                    fulfill(batches);
                });
            });
        }
    };

    function readDbIds(callback){
        async.waterfall([
            openDbConnection,
            readDbIdsInternal
        ], callback);
    }

    function openDbConnection(callback){
        dbConnectionFactory("TWU_CRON_USERNAME_DB_CONNECTION_STRING")
            .then((db) => {
                callback(null, db);
            }, callback);
    }

    function readDbIdsInternal(db, callback){
        usernameDataServiceFn(db)
            .all()
            .then((dbUsers) => {
                var dbIds = userIdHelper.extractIds(dbUsers);
                console.log("userIdBatchBuilder.readDbIdsInternal", "resultLength=", (dbIds || []).length);
                callback(null, dbIds);
            }, callback);
    }

    function readAllIds(callback){
        async.waterfall([
            readRegisteredUsers,
            readAllIdsInternal
        ], callback);
    }

    function readRegisteredUsers(callback){
        registeredUsersDataService
            .all()
            .then((registeredUsers) => {
                console.log("userIdBatchBuilder.readRegisteredUsers", "resultLength=", (registeredUsers || []).length);
                callback(null, registeredUsers);
            }, callback);
    }

    function readAllIdsInternal(registeredUsers, callback){
        userIdsReader
            .getAllIdsFor(registeredUsers)
            .then((allIds) => {
                console.log("userIdBatchBuilder.readAllIdsInternal", "resultLength=", (allIds || []).length);
                callback(null, allIds);
            }, callback);
    }
}