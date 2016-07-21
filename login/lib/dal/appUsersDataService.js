var promise = require("the-promise-factory");
var isoDateStr = require("iso-date-str");

module.exports = function(db, dateSvc){
    if (!db) throw new Error("A database is required");
    if (!dateSvc) dateSvc = isoDateStr;

    var MODEL_VERSION = 1.0;

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
            return promise.create((fulfill, reject) => {
                getCollection()
                    .updateOne(
                        {twitter_user_id: id.toString()},
                        {
                            $set: { 
                                oauth_access_token: credentials.oauth_access_token,
                                oauth_access_token_secret: credentials.oauth_access_token_secret,
                                modified_time_str: dateSvc()
                            }
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
        all: function(){
            return promise.create((fulfill, reject) => {
                getCollection()
                    .find()
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