module.exports = function(dbConnection3, userScheduleDataService, apiKey, webError){
    return {
        update: (userId, reqApiKey, response) => {
            webError.unauthorized(response, "Unauthorized");
        }
    };
};