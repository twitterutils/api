module.exports = function (
    dbConnectionFactory,
    notificationsDataService,
    apiKey,
    webError) {
    return {
        recent: function(userId, maxCount, reqApiKey, response){
            if (!apiKey.isValid(reqApiKey)){
                webError.unauthorized(response, "Unauthorized");
                return;
            }

            dbConnectionFactory(response, "NOTIFICATIONS_DB_CONNECTION_STRING")
                .then((db) => {
                    notificationsDataService(db)
                        .recentNotifications()
                        .then(null, (err) => {
                            webError.unexpected(response, "Db Error reading notifications", err);
                        });
                });
        }
    }
}