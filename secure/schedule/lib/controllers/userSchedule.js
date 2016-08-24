

module.exports = function(
    dbConnectionFactory,
    userScheduleDataServiceFactory,
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
                    var dataService = userScheduleDataServiceFactory(db);

                    dataService
                        .first(userId)
                        .then((scheduleInfo) => {
                            if (!scheduleInfo){
                                scheduleInfo = { readCount: 0 };
                            }

                            var updatedStatus = {
                                readCount: scheduleInfo.readCount + 1
                            };

                            console.log("Updating-User-Schedule",
                                "userId=", userId,
                                "readCount", updatedStatus.readCount
                            );

                            dataService
                                .update(userId, updatedStatus)
                                .then(() => {
                                    response.send({success: true});
                                }, (err) => {
                                    webError.unexpected(response, "Error Updating Schedule", err);
                                });
                        }, (err) => {
                            webError.unexpected(response, "Error Updating Schedule", err);
                        })
                });
        }
    };
};