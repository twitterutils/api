var promise = require("the-promise-factory");
var isoDateStr = require("iso-date-str");

module.exports = function(db, dateSvc) {
    if (!db) throw new Error("A database is required");
    if (!dateSvc) dateSvc = isoDateStr;

    var MODEL_VERSION = 1.0;

    return {
        all: function(){
            return promise.create((fulfill, reject) => {
                db
                    .collection("usernames_list")
                    .find()
                    .toArray()
                    .then(fulfill, reject);
            });
        },
        save: function(username){
            console.log("usernameDataService.save", username);

            return promise.create((fulfill, reject) => {
                db
                    .collection("usernames_list")
                    .insert({
                        id: username.id.toString(),
                        userName: username.name,
                        version: MODEL_VERSION,
                        creation_time_str: dateSvc()
                    }, (err, result) => {
                        if (err) return reject(err);

                        fulfill(result);
                    });
            });
        }
    };
}