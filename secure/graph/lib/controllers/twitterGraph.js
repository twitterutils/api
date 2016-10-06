module.exports = function(dbConnectionFactory, twitterGraphDataService, apiKey, webError) {
    return {
        details: function(graphId, reqApiKey, response){
            if (!apiKey.isValid(reqApiKey)){
                webError.unauthorized(response, "Unauthorized");
                return;
            }

            dbConnectionFactory(response, "TWU_API_GRAPH_DB_CONNECTION_STRING")
                .then((db) => {
                    twitterGraphDataService(db)
                        .first(graphId)
                        .then((twitterGraph) => {
                            if (!twitterGraph){
                                webError.notFound(response, "Graph not found");
                                return;
                            }

                            response.send({
                                id: twitterGraph.id,
                                graphId: twitterGraph.graphId,
                                userName: twitterGraph.userName,
                                friends: twitterGraph.friends,
                                followers: twitterGraph.followers
                            });
                        }, (err) => {
                            webError.unexpected(response, "Db Error finding users", err);
                        });
                });
        }
    }
};