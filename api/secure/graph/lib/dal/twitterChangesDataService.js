var promise = require("the-promise-factory");

module.exports = function(db){
    if (!db) throw new Error("A database is required");

    return {
        changesFor: function(twitterUserId, graphIds){
            return promise.create((fulfill, reject) => {

                var queryParameters = {
                    $or: [
                        {target: twitterUserId.toString()},
                        {originator: twitterUserId.toString()}
                    ]
                };

                if (graphIds){
                    queryParameters.currId = {$in: graphIds};
                }

                db
                    .collection("crawler_twitter_changes")
                    .find(queryParameters)
                    .limit(500)
                    .toArray()
                    .then((result) => {
                        fulfill(result);
                    }, reject);
            });
        }
    };
}