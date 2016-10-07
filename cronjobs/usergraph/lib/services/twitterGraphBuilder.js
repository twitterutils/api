var promise = require("the-promise-factory");
var async = require("async");
var rfr = require("rfr");
var idGenerator = rfr("usergraph/lib/helpers/idGenerator");

module.exports = function(twitterDataService, uniqueIdGenerator){
    if (!uniqueIdGenerator) uniqueIdGenerator = idGenerator;

    return {
        buildGraphFor: function(userInfo){
            return promise.create((fulfill, reject) => {
                function execute(fn, callback){
                    fn.call(twitterDataService, userInfo.userName)
                        .then((result) => {
                            callback(null, result);
                        }, (err) => {
                            callback(err);
                        });
                }

                async.parallel({
                    friends: (callback) => {
                        execute(twitterDataService.getFriends, callback);
                    },
                    followers: (callback) => {
                        execute(twitterDataService.getFollowers, callback);
                    }
                }, (err, results) => {
                    if (err) return reject(err);

                    fulfill({
                        id: userInfo.id,
                        graphId: uniqueIdGenerator(),
                        userName: userInfo.userName,
                        friends: results.friends,
                        followers: results.followers
                    });
                });
            });
        }
    };
};