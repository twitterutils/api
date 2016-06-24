var promise = require("the-promise-factory");

module.exports = function(db){
    if (!db) throw new Error("A database is required");

    return {
        changesFor: function(twitterUserId, graphIds){
            return promise.create((fulfill, reject) => {

                var queryParameters = {
                    $or: [
                        {target: twitterUserId},
                        {originator: twitterUserId}
                    ]
                };

                if (graphIds){
                    queryParameters.currId = {$in: graphIds};
                }

                db
                    .collection("crawler_twitter_changes")
                    .find(queryParameters)
                    .toArray()
                    .then((result) => {
                        fulfill(result);
                    }, reject);
            });
        }
    };
}