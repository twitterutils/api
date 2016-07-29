var promise = require("the-promise-factory");

module.exports = function (db) {
    if (!db) throw new Error("A database is required");

    return {
        read: (userName) => {
            return promise.create((fulfill, reject) => {
                db
                    .collection("feed_list")
                    .findOne({}, (err, result) => {
                        reject(err);
                    });
            });
        }
    }
}