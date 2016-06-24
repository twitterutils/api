var promise = require("the-promise-factory");

module.exports = function(db){
    if (!db) throw new Error("A database is required");

    return {
        first: function(twitterUserId){
            return promise.create((fulfill, reject) => {
                db
                    .collection("crawler_twitter_graph")
                    .findOne(
                        {id: twitterUserId},
                        (err, result) => {
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
}