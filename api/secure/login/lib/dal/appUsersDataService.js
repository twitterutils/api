var promise = require("the-promise-factory");
var isoDateStr = require("iso-date-str");

module.exports = function(db, dateSvc){
    if (!db) throw new Error("A database is required");
    if (!dateSvc) dateSvc = isoDateStr;

    var MODEL_VERSION = 1.1;

    return {
        create: function(appUser){
            appUser.twitter_user_id = appUser.twitter_user_id.toString();
            appUser.version = MODEL_VERSION;
            appUser.creation_time_str = dateSvc();
            appUser.modified_time_str = dateSvc();

            return getPromise("insert", appUser);
        },
        first: function(id){
            return getPromise("findOne", {twitter_user_id: id.toString()});
        },
        updateCredentials: function(id, credentials){
            if (!credentials) {
                credentials = {};
            }
            credentials.modified_time_str = dateSvc();

            return promise.create((fulfill, reject) => {
                getCollection()
                    .updateOne(
                        {twitter_user_id: id.toString()},
                        {
                            $set: credentials
                        }, 
                        (err, result) => {
                            if (err) {
                                reject(err);
                            }
                            else{
                                fulfill(result);
                            }
                        });
            });
        },
        all: function(queryParameter){
            if (!queryParameter) {
                queryParameter = {};
            }

            return promise.create((fulfill, reject) => {
                getCollection()
                    .find(queryParameter)
                    .toArray()
                    .then((dbUsers) => {
                        var result = dbUsers.map((user) => {
                            return {
                                id: user.twitter_user_id,
                                user_name: user.twitter_screen_name
                            };
                        });
                        fulfill(result);
                    }, reject);
            });
        }
    };

    function getCollection(){
        return db.collection("login_app_users");
    }

    function getPromise(fnName, firstArg){
        return promise.create((fulfill, reject) => {
            getCollection()[fnName](firstArg, (err, result) => {
                if (err) {
                    reject(err);
                }
                else{
                    fulfill(result);
                }
            });
        });
    }
};