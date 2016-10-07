module.exports = function (db) {
    if (!db) throw new Error("A database is required");

    return {
        clear: function(){
            return db
                .collection("schedule_upcoming_list")
                .remove();
        },
        insert: function(userIds){
            userIds = (userIds || []).map((id) => {
                return {
                    userId: id.toString()
                }
            });

            return db
                .collection("schedule_upcoming_list")
                .insert(userIds);
        }
    }
}