var promise = require("the-promise-factory");
var async = require("async");

module.exports = function(
    dbConnectionFactory,
    usernameDataServiceFn,
    usernameReader) {
    return {
        run: function(){
            return promise.create((fulfill, reject) => {
                async.parallel({
                    db: openDbConnection,
                    users: readUsers
                }, (err, result) => {
                    if (err) return reject(err);

                    var usernameDataService = usernameDataServiceFn(result.db);

                    async.forEachOf(
                        result.users,
                        saveUser(usernameDataService),
                        (err) => {
                            if (err) return reject(err);

                            fulfill();
                        }
                    );
                });
            });
        }
    };

    function openDbConnection(callback){
        dbConnectionFactory("TWU_CRON_USERNAME_DB_CONNECTION_STRING")
            .then((db) => {
                callback(null, db);
            }, callback);
    }

    function readUsers(callback){
        usernameReader
            .read()
            .then((users) => {
                callback(null, users);
            }, callback);
    }

    function saveUser(usernameDataService){
        return (user, key, callback) => {
            usernameDataService
                .save(user)
                .then(() => {
                    callback(null);
                }, callback);
        }
    }
}