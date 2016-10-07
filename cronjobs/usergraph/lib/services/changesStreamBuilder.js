var async = require("async");
var _ = require("underscore");
var promise = require("the-promise-factory");

module.exports = function(changesAnalyzer){
    return {
        getChanges: (currentGraph, previousGraph) => {
            function invokeAnalyzerOriginated(fn, eventName){
                return fn.call(changesAnalyzer, currentGraph, previousGraph)
                    .map((id) => {
                        return {
                            type: eventName,
                            originator: currentGraph.id,
                            target: id,
                            prevId: previousGraph.graphId,
                            currId: currentGraph.graphId
                        };
                    });
            }

            function invokeAnalyzerTargetted(fn, eventName){
                return fn.call(changesAnalyzer, currentGraph, previousGraph)
                    .map((id) => {
                    return {
                        type: eventName,
                        originator: id,
                        target:  currentGraph.id,
                        prevId: previousGraph.graphId,
                        currId: currentGraph.graphId
                    };
                });
            }

            return promise.create((fulfill, reject) => {
                async.parallel([
                    (callback) => {
                        callback(
                            null,
                            invokeAnalyzerOriginated(changesAnalyzer.determineAddedFriends, "friend")
                        );
                    },
                    (callback) => {
                        callback(
                            null,
                            invokeAnalyzerOriginated(changesAnalyzer.determineRemovedFriends, "unfriend")
                        );
                    },
                    (callback) => {
                        callback(
                            null,
                            invokeAnalyzerTargetted(changesAnalyzer.determineAddedFollowers, "follow")
                        );
                    },
                    (callback) => {
                        callback(
                            null,
                            invokeAnalyzerTargetted(changesAnalyzer.determineRemovedFollowers, "unfollow")
                        );
                    }
                ], (err, results) => {
                    if (err) return reject(err);

                    var allEvents = _.flatten(results);
                    fulfill(allEvents);
                });
            });
        }
    }
}