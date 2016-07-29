module.exports = function (dbConnectionFactory, userFeedDataService, webError) {
    return {
        read: (userName, response) => {
            dbConnectionFactory(response, "FEEDBUILDER_DB_CONNECTION_STRING")
                .then((db) => {
                    userFeedDataService(db)
                        .read(userName)
                        .then((feed) => {

                        }, (err) => {
                            webError.unexpected(response, "Db Error reading user feed", err);
                        });
                })
        }
    }
}