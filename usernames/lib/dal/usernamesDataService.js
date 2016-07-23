var promise = require("the-promise-factory");

module.exports = function (db) {
    if (!db) throw new Error("A database is required");

    return {
        find: function(userIds){
            return promise.create((fulfill, reject) => {
                userIds = (userIds || []).map((id) => {
                    return id.toString();
                });

                db
                    .collection("usernames_list")
                    .find({id: {$in: userIds}})
                    .toArray()
                    .then(fulfill, reject);
            });
        }
    }
}