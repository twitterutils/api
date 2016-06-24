var _ = require("underscore");

module.exports = function(
    dbConnectionFactory,
    twitterChangesDataService,
    twitterGraphDataService,
    apiKey,
    webError
    ) {

    function readChanges(db, response, twitterUserId, graphIds){
        twitterChangesDataService(db)
            .changesFor(twitterUserId, graphIds)
            .then((twitterUserChanges) => {
                if (!twitterUserChanges){
                    webError.notFound(response, "Changes not found");
                    return;
                }

                var twitterUserChangesSorted = _.sortBy(twitterUserChanges, (change) => {
                     return change._id;
                });

                response.send(_.map(twitterUserChangesSorted, (change) => {
                    return {
                        type: change.type,
                        originator: change.originator,
                        target: change.target,
                        prevId: change.prevId,
                        currId: change.currId
                    };
                }));
            }, (err) => {
                webError.unexpected(response, "Error reading changes", err);
            });
    }

    return {
        list: function(twitterUserId, reqApiKey, response){
            if (!apiKey.isValid(reqApiKey)){
                webError.unauthorized(response, "Unauthorized");
                return;
            }

            dbConnectionFactory(response)
                .then((db) => {
                    readChanges(db, response, twitterUserId);
                });
        },
        changesForUserCreatedAfter: function(graphId, reqApiKey, response){
            if (!apiKey.isValid(reqApiKey)){
                webError.unauthorized(response, "Unauthorized");
                return;
            }

            dbConnectionFactory(response)
                .then((db) => {
                    twitterGraphDataService(db)
                        .first(graphId)
                        .then((twitterGraph) => {

                            if (!twitterGraph){
                                webError.notFound(response, "Graph not found");
                                return;
                            }

                            twitterGraphDataService(db)
                                .graphsForUserCreatedAfter(twitterGraph)
                                .then((graphs) => {
                                    if (!graphs){
                                        webError.notFound(response, "Graph list not found");
                                        return;
                                    }

                                    var graphIds = _.map(graphs, (graph) => {
                                        return graph.graphId;
                                    });

                                    readChanges(db, response, twitterGraph.id, graphIds);
                                },
                                    unexpected("Error reading user graphs")
                                );
                        },
                            unexpected("Error finding graph")
                        );
                });

            function unexpected(errorMessage){
                return (err) => {
                    webError.unexpected(response, errorMessage, err);
                };
            }
        }
    }
};