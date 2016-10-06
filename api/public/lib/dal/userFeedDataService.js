var promise = require("the-promise-factory");

module.exports = function (db) {
    if (!db) throw new Error("A database is required");

    return {
        read: (userName) => {
            var searchString = (userName || "");
            var regex = new RegExp(["^", searchString, "$"].join(""), "i");

            return promise.create((fulfill, reject) => {
                db
                    .collection("feed_list")
                    .findOne({userName: regex}, (err, result) => {
                        if (err) return reject(err);

                        fulfill((result || {}).items || null);
                    });
            });
        }
    }
}