var promise = require("the-promise-factory");
var isoDateStr = require("iso-date-str");

module.exports = function(db, dateSvc){
    if (!db) throw new Error("A database is required");
    if (!dateSvc) dateSvc = isoDateStr;

    var MODEL_VERSION = 1.1;

    return {
        save: function(twitterGraph){
            return promise.create((fulfill, reject) => {
                dbCollectionGraphs()
                    .updateOne(
                        {id: twitterGraph.id.toString()},
                        {
                            $set: {
                                id: twitterGraph.id.toString(),
                                graphId: twitterGraph.graphId,
                                userName: twitterGraph.userName,
                                friends: mapToString(twitterGraph.friends),
                                followers: mapToString(twitterGraph.followers),
                                version: MODEL_VERSION,
                                modified_time_str: dateSvc()
                            }
                        },
                        {upsert: true},
                        handleResult(fulfill, reject)
                    );
            });
        },
        saveHistory: function(twitterGraph){
            return promise.create((fulfill, reject) => {
                dbCollectionHistory()
                    .insert({
                        id: twitterGraph.id.toString(),
                        graphId: twitterGraph.graphId,
                        userName: twitterGraph.userName,
                        friends: mapToString(twitterGraph.friends),
                        followers: mapToString(twitterGraph.followers),
                        version: MODEL_VERSION,
                        modified_time_str: dateSvc()
                    },
                    handleResult(fulfill, reject));
            });
        },
        first: function(id){
            return promise.create((fulfill, reject) => {
                dbCollectionGraphs()
                    .findOne(
                        {id: id.toString()},
                        handleResult(fulfill, reject)
                    );
            });
        }
    };

    function handleResult(fulfill, reject) {
        return (err, result) => {
            if (err) return reject(err);

            fulfill(result);
        };
    }

    function dbCollectionGraphs(){
        return db.collection("crawler_twitter_graph");
    }

    function dbCollectionHistory(){
        return db.collection("crawler_twitter_graph_history");
    }

    function mapToString(arr){
        return arr.map((i) => {
            return i.toString();
        });
    }
}