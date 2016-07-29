module.exports = function (dbConnectionFactory, userFeedDataService, webError) {
    return {
        read: (userName, response) => {
            dbConnectionFactory(response, "FEEDBUILDER_DB_CONNECTION_STRING")
                .then((db) => {
                    userFeedDataService(db)
                        .read(userName)
                        .then((feedItems) => {
                            if (!feedItems){
                                webError.notFound(response, "User not found");
                                return;
                            }

                            var result = feedItems.map((i) => {
                                return {
                                    id: i.id,
                                    type: i.type,
                                    userId: i.userId,
                                    details: i.details,
                                    userName: i.userName,
                                    url: i.url,
                                    creation_time_str: i.creation_time_str
                                };
                            });
                            response.send(result);
                        }, (err) => {
                            webError.unexpected(response, "Db Error reading user feed", err);
                        });
                })
        }
    }
}