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

            dbConnectionFactory(response, "TWU_API_NOTIFICATIONS_DB_CONNECTION_STRING")
                .then((db) => {
                    notificationsDataService(db)
                        .recentNotifications(userId, maxCount)
                        .then((notifications) => {
                            var result = notifications.map((n) => {
                                return {
                                    id: n._id.toString(),
                                    type: n.type,
                                    userId: n.userId,
                                    details: n.details,
                                    creation_time_str: n.creation_time_str
                                }
                            });
                            response.send(result);
                        }, (err) => {
                            webError.unexpected(response, "Db Error reading notifications", err);
                        });
                });
        }
    }
}