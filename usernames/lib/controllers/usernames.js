module.exports = function (
    dbConnectionFactory,
    notificationsDataService,
    apiKey,
    webError) {
    return {
        find: function(userIds, reqApiKey, response){
            if (!apiKey.isValid(reqApiKey)){
                webError.unauthorized(response, "Unauthorized");
                return;
            }

            webError.unexpected(response, "Db Error reading notifications", "seeded error");
        }
    }
}