var promise = require("the-promise-factory");
var async = require("async");

module.exports = function (userIdBatchBuilder, twitterUsersDataService) {
    return {
        read: function(){
            return promise.create((fulfill, reject) => {
                userIdBatchBuilder.build()
                    .then((batches) => {
                        async.concat(
                            batches,
                            readUsers,
                            (err, result) => {
                                if (err) return reject(err);

                                console.log("usernameReader.read", "resultLength=", (result || []).length);

                                fulfill(result);
                            }
                        );

                    }, reject);
            });
        }
    };

    function readUsers(ids, callback){
        twitterUsersDataService
            .getUsers(ids)
            .then((users) => {
                callback(null, users);
            }, callback);
    }
}