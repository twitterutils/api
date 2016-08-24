module.exports = function(dbConnection3, userScheduleDataService, apiKey, webError){
    return {
        update: (userId, reqApiKey, response) => {
            if (!apiKey.isValid(reqApiKey)) {
                webError.unauthorized(response, "Unauthorized");
                return;
            }

            dbConnection3(response, "SCHEDULE_DB_CONNECTION_STRING")
                .then((db) => {
                    userScheduleDataService(db)
                        .first(userId)
                        .then((scheduleInfo) => {

                        }, (err) => {
                            webError.unexpected(response, "Error Reading Schedule", "seeded error");
                        })
                });
        }
    };
};