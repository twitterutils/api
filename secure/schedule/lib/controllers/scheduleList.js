module.exports = function(
    dbConnectionFactory,
    scheduleListDataService,
    apiKey,
    webError){
    return {
        all: (reqApiKey, response) => {
            if (!apiKey.isValid(reqApiKey)) {
                webError.unauthorized(response, "Unauthorized");
                return;
            }

            dbConnectionFactory(response, "SCHEDULE_DB_CONNECTION_STRING")
                .then((db) => {
                    scheduleListDataService(db)
                        .all()
                        .then((userIds) => {
                            var result = (userIds || [])
                                .map((u) => u.userId.toString());
                            response.send(result);
                        }, (err) => {
                            webError.unexpected(response, "Error Updating Schedule", err);
                        })
                });
        }
    };
};