var promise = require("the-promise-factory");

module.exports = function (db) {
    if (!db) throw new Error("A database is required");

    return {
        read: (userName) => {
            return promise.create((fulfill, reject) => {
                db
                    .collection("feed_list")
                    .findOne({userName: userName}, (err, result) => {
                        if (err) return reject(err);

                        fulfill(result.items);
                    });
            });
        }
    }
}