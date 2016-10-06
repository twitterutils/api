module.exports = function(db) {
    if (!db) throw new Error("A database is required");

    return {
        all: function(){
            return db
                .collection("schedule_upcoming_list")
                .find()
                .toArray();
        }
    }
}