var promise = require("the-promise-factory");
var isoDateStr = require("iso-date-str");

module.exports = function (db, dateSvc) {
    if (!db) throw new Error("A database is required");
    if (!dateSvc) dateSvc = isoDateStr;

    var MODEL_VERSION = 1.0;

    return {
        save: function(change){
            console.log("twitterChangesDataService.save", "change=", JSON.stringify(change));

            return promise.create((fulfill, reject) => {
                dbCollection()
                    .insert({
                        type: change.type,
                        originator: change.originator.toString(),
                        target: change.target.toString(),
                        prevId: change.prevId,
                        currId: change.currId,
                        version: MODEL_VERSION,
                        modified_time_str: dateSvc()
                    },
                    handleResult(fulfill, reject));
            });
        }
    };

    function handleResult(fulfill, reject) {
        return (err, result) => {
            if (err) return reject(err);

            fulfill(result);
        };
    }

    function dbCollection(){
        return db.collection("crawler_twitter_changes");
    }
}