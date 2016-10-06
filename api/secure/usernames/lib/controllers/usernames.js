module.exports = function (
    dbConnectionFactory,
    usernamesDataService,
    apiKey,
    webError) {
    return {
        find: function(userIdsStr, reqApiKey, response){
            if (!apiKey.isValid(reqApiKey)){
                webError.unauthorized(response, "Unauthorized");
                return;
            }

            var userIds = userIdsStr.split(",");

            dbConnectionFactory(response, "TWU_API_USERNAMES_DB_CONNECTION_STRING")
                .then((db) => {
                    usernamesDataService(db)
                        .find(userIds)
                        .then((usernames) => {
                            var result = usernames.map((u) => {
                                return {
                                    userId: u.id,
                                    userName: u.userName
                                };
                            })

                            response.send(result);
                        }, (err) => {
                            webError.unexpected(response, "Db Error reading notifications", err);
                        })
                });
        }
    }
}