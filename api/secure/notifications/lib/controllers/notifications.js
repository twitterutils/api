module.exports = function(
    dbConnectionFactory,
    notificationsDataService,
    apiKey,
    webError
    ){
    return {
        send: (requestBody, requestHeaders, response) => {
            if (!apiKey.isValid(requestHeaders.authorization)) {
                webError.unauthorized(response, "Unauthorized");
                return;
            }

            dbConnectionFactory(response, "TWU_API_NOTIFICATIONS_DB_CONNECTION_STRING")
                .then((db) => {
                    notificationsDataService(db)
                        .save({
                            type: requestBody.type,
                            userId: requestBody.userid,
                            details: requestBody.details
                        }).then(() => {
                            response.send({success: true});
                        }, (err) => {
                            webError.unexpected(response, "Error Saving Notification", err);
                        });
                });
        }
    };
}