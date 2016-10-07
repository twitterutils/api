module.exports = function(
    userFeedServiceFn,
    notificationsDataService,
    usernamesDataService,
    userIdHelper,
    notificationsTransformer,
    feedDataServiceFn) {
    return {
        create: function(db){
            if (!db) throw new Error("A database is required");

            return userFeedServiceFn(
                notificationsDataService,
                usernamesDataService,
                userIdHelper,
                notificationsTransformer,
                feedDataServiceFn(db)
            )
        }
    }
}