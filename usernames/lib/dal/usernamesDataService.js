module.exports = function (db) {
    if (!db) throw new Error("A database is required");

    return {
        find: function(userIds){
            userIds = (userIds || []).map((id) => {
                return id.toString();
            });

            return db
                .collection("usernames_list")
                .find({id: {$in: userIds}})
                .toArray();
        }
    }
}