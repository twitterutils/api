module.exports = function(dbConnection3, userScheduleDataService, apiKey, webError){
    return {
        update: (userId, reqApiKey, response) => {
            response.send({success: true});
        }
    };
};