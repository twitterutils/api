var promise = require("the-promise-factory");
var async = require("async");

module.exports = function(userStatusDataService, graphDataService){
    return {
        read: function(user){
            return promise.create((fulfill, reject) => {
                async.parallel({
                    changes: readChanges(user),
                    userDetails: readUserDetails(user)
                }, (err, results) => {
                    if (err) return reject(err);

                    userStatusDataService
                        .save(results.userDetails.id, results.userDetails.graphId)
                        .then(() => {
                            fulfill({
                                userDetails: results.userDetails,
                                changes: results.changes
                            });
                        }, reject);
                });
            });
        }
    };

    function readUserDetails(user) {
        return (callback) => {
            promiseToAsync(graphDataService.userDetails(user.id), callback);
        };
    }

    function readChanges(user){
        return (callback) => {
            userStatusDataService.first(user.id)
                .then((userStatus) => {
                    userStatus = userStatus || {};

                    if (userStatus.graphId){
                        promiseToAsync(graphDataService.recentChanges(userStatus.graphId), callback);
                    }
                    else{
                        promiseToAsync(graphDataService.userChanges(user.id), callback);
                    }
                }, callback);
        };
    }

    function promiseToAsync(promise, asyncCallback){
        promise.then((result) => {
            asyncCallback(null, result);
        }, asyncCallback);
    }
}