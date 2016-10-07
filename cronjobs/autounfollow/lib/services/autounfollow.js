var promise = require("the-promise-factory");
var async = require("async");

module.exports = function(dbConnectionFactory, registeredUsersDataService, singleUserProcessorFactory) {
    return {
        run: function(){
            return promise.create((fulfill, reject) => {
                async.parallel({
                    db: createDb(),
                    users: readUsers()
                }, (err, results)=> {
                    if (err) return reject(err);

                    async.forEachOf(results.users, processSingleUser(results.db), (err) => {
                        if (err) return reject(err);

                        fulfill();
                    });
                });
            });
        }
    };

    function createDb(){
        return (callback) => {
            dbConnectionFactory("TWU_CRON_AUTOUNFOLLOW_DB_CONNECTION_STRING")
                .then((db) => {
                    callback(null, db);
                }, callback);
        };
    }

    function readUsers(){
        return (callback) => {
            registeredUsersDataService
                .all()
                .then((users) => {
                    callback(null, users);
                }, callback);
        };
    }

    function processSingleUser(db){
        return (user, key, callback) => {
            singleUserProcessorFactory
                .create(db)
                .process(user)
                .then(() => {
                    callback(null);
                }, callback);
        };
    }
}