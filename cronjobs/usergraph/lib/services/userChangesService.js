var promise = require("the-promise-factory");
var async = require("async");

module.exports = function(
    twitterGraphBuilder,
    twitterGraphDataService,
    changesStreamBuilder,
    userScheduleDataService){
    return {
        changesFor: function (user){
            return promise.create((fulfill, reject) => {
                async.parallel({
                    prevTwitterGraph: readPreviousTwitterGraph,
                    currentTwitterGraph: readCurrentTwitterGraph,
                    updateScheduleResult: updateUserSchedule
                },
                function(err, graphs) {
                    if (err) {
                        broadcastError(err);
                        return;
                    }

                    if (!graphs.prevTwitterGraph){
                        save(graphs, []);
                        return;
                    }

                    changesStreamBuilder
                        .getChanges(graphs.currentTwitterGraph, graphs.prevTwitterGraph)
                        .then((changes) => {
                            console.log("userChangesService.changesFor.completed", "user_id=", user.id, "changesLength=", (changes || []).length);

                            if (!changes || changes.length === 0) {
                                broadcastSuccess(changes);
                                return;
                            }

                            save(graphs, changes);
                        }, reject);
                });

                function save(graphs, changes){
                    saveGraphs(graphs, resultCallback(changes));
                }

                function broadcastSuccess(changes){
                    resultCallback(changes)();
                }

                function broadcastError(err){
                    resultCallback()(err);
                }

                function resultCallback(changes){
                    return (err) => {
                        if (err) return reject(err);
                        fulfill(changes);
                    };
                }
            });

            function invokeAsync(callback, logMessage){
                return (result) => {
                    if (logMessage){
                        console.log("userChangesService."+logMessage, "user_id=", user.id);
                    }

                    callback(null, result);
                };
            }

            function readPreviousTwitterGraph(callback){
                twitterGraphDataService
                    .first(user.id)
                    .then(invokeAsync(callback, "readPreviousTwitterGraph"), callback);
            }

            function readCurrentTwitterGraph(callback){
                twitterGraphBuilder
                    .buildGraphFor(user)
                    .then(invokeAsync(callback, "readCurrentTwitterGraph"), callback);
            }

            function updateUserSchedule(callback){
                userScheduleDataService
                    .update(user.id)
                    .then(invokeAsync(callback, "updateUserSchedule"), callback);
            }

            function saveGraphs(graphs, callback){
                async.parallel({
                    save: updateStoredTwitterGraph(graphs),
                    saveHistory: saveTwitterGraphHistory(graphs)
                }, callback);
            }

            function updateStoredTwitterGraph(graphs){
                return function(callback){
                    twitterGraphDataService
                        .save(graphs.currentTwitterGraph)
                        .then(invokeAsync(callback, "updateStoredTwitterGraph"), callback);
                };
            }

            function saveTwitterGraphHistory(graphs) {
                return function(callback){
                    twitterGraphDataService
                        .saveHistory(graphs.currentTwitterGraph)
                        .then(invokeAsync(callback, "saveTwitterGraphHistory"), callback);
                };
            }
        }
    };
}