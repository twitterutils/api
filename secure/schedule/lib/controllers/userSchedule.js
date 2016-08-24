module.exports = function(dbConnection3, userScheduleDataService, apiKey, webError){
    return {
        update: (userId, reqApiKey, response) => {
            if (!apiKey.isValid(reqApiKey)) {
                webError.unauthorized(response, "Unauthorized");
                return;
            }

            dbConnection3(response, "SCHEDULE_DB_CONNECTION_STRING")
                .then((db) => {
                    var dataService = userScheduleDataService(db);

                    dataService
                        .first(userId)
                        .then((scheduleInfo) => {
                            if (!scheduleInfo){
                                scheduleInfo = { readCount: 0 };
                            }

                            var updatedStatus = {
                                readCount: scheduleInfo.readCount + 1
                            };
                            dataService
                                .update(userId, updatedStatus)
                                .then(() => {
                                    response.send({success: true});
                                }, (err) => {
                                    webError.unexpected(response, "Error Updating Schedule", err);
                                });
                        }, (err) => {
                            webError.unexpected(response, "Error Reading Schedule", err);
                        })
                });
        }
    };
};