module.exports = function(dbConnection3, appUsersDataService, apiKey, webError){
    return {
        update: (userId, reqApiKey, response) => {
            response.send({success: true});
        }
    };
};