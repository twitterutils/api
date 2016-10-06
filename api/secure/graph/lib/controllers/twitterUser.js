module.exports = function(dbConnectionFactory, twitterUserDataService, apiKey, webError) {
    return {
        details: function(twitterUserId, reqApiKey, response){
            if (!apiKey.isValid(reqApiKey)){
                webError.unauthorized(response, "Unauthorized");
                return;
            }

            dbConnectionFactory(response, "TWU_API_GRAPH_DB_CONNECTION_STRING")
                .then((db) => {
                    twitterUserDataService(db)
                        .first(twitterUserId)
                        .then((twitterUser) => {
                            if (!twitterUser){
                                webError.notFound(response, "User not found");
                                return;
                            }

                            response.send({
                                id: twitterUser.id,
                                graphId: twitterUser.graphId,
                                userName: twitterUser.userName,
                                friends: twitterUser.friends,
                                followers: twitterUser.followers
                            });
                        }, (err) => {
                            webError.unexpected(response, "Db Error finding users", err);
                        });
                });
        }
    }
};