module.exports = function(db) {
    if (!db) throw new Error("A database is required");

    return {
        read: function(userIds){
            userIds = (userIds || []).map((id) => {
                return id.toString();
            });

            return db
                .collection("schedule_user_status")
                .find({id: {$in: userIds}})
                .toArray();
        }
    }
}