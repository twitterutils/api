var promise = require("the-promise-factory");
var async = require("async");

module.exports = function (registeredUsersDataService, dbConnectionFactory, userFeedServiceFactory) {
    return {
        build: function(){
            return promise.create((fulfill, reject) => {
                async.parallel({
                    users: readRegisteredUsers,
                    userFeedService: createUserFeedService
                }, (err, result) => {
                    if (err) return reject(err);

                    async.forEachOf(
                        result.users,
                        processSingleUser(result.userFeedService),
                        (err) => {
                            if (err) return reject(err);

                            fulfill();
                        }
                    );
                });
            });
        }
    }

    function readRegisteredUsers(callback){
        registeredUsersDataService
            .all()
            .then((users) => {
                callback(null, users);
            }, callback);
    }

    function createUserFeedService(callback){
        dbConnectionFactory("TWU_CRON_FEEDBUILDER_DB_CONNECTION_STRING")
            .then((db) => {
                var userFeedService = userFeedServiceFactory.create(db);
                callback(null, userFeedService);
            }, callback);
    }

    function processSingleUser(userFeedService){
        return (user, key, callback) => {
            console.log("feedBuilder.processSingleUser", user);
            userFeedService
                .save(user)
                .then(() => {
                    callback(null)
                }, callback);
        }
    }
}