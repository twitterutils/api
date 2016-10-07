var promise = require("the-promise-factory");
var async = require("async");

module.exports = function(twitterChangesDataService){
    return {
        broadcast: function(changes){
            return promise.create((fulfill, reject) => {
                async.each(
                    changes,
                    (change, callback) => {
                        twitterChangesDataService
                            .save(change)
                            .then(() => {
                                callback(null);
                            }, callback);
                    },
                    (err) => {
                        if (err) return reject(err);
                        fulfill();
                    }
                );
            });
        }
    }
};