module.exports = function(
    dbConnectionFactory,
    userScheduleServiceFactory,
    apiKey,
    webError){
    return {
        update: (userId, reqApiKey, response) => {
            if (!apiKey.isValid(reqApiKey)) {
                webError.unauthorized(response, "Unauthorized");
                return;
            }

            dbConnectionFactory(response, "SCHEDULE_DB_CONNECTION_STRING")
                .then((db) => {
                    userScheduleServiceFactory
                        .create(db)
                        .update(userId)
                        .then(() => {
                            response.send({success: true});
                        }, (err) => {
                            webError.unexpected(response, "Error Updating Schedule", err);
                        })
                });
        }
    };
};