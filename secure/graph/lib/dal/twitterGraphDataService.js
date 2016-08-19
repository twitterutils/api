var promise = require("the-promise-factory");

module.exports = function(db){
    if (!db) throw new Error("A database is required");

    return {
        first: function(graphId){
            return promise.create((fulfill, reject) => {
                db
                    .collection("crawler_twitter_graph_history")
                    .findOne(
                        {graphId: graphId},
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
        graphsForUserCreatedAfter: function(twitterGraph){
            return promise.create((fulfill, reject) => {
                db
                    .collection("crawler_twitter_graph_history")
                    .find({
                        id: twitterGraph.id.toString(),
                        _id: {
                            $gt: twitterGraph._id
                        }
                    })
                    .toArray()
                    .then((result) => {
                        fulfill(result);
                    }, reject);
            });
        }
    };
}