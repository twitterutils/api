module.exports = function (
    dbConnectionFactory,
    notificationsDataService,
    apiKey,
    webError) {
    return {
        find: function(userIds, apiKey, response){
            webError.unauthorized(response, "Unauthorized");
        }
    }
}