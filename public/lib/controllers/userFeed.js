module.exports = function (dbConnectionFactory, userFeedDataService) {
    return {
        read: (userName, response) => {
            dbConnectionFactory(response, "FEEDBUILDER_DB_CONNECTION_STRING")
                .then((db) => {
                    userFeedDataService(db).read(userName);
                })
        }
    }
}