module.exports = function(
    dbConnectionFactory,
    scheduleListDataService,
    apiKey,
    webError){
    return {
        all: (reqApiKey, response) => {
            response.send([
                "1111111",
                "2222222",
                "3333333"
            ]);
        }
    };
};