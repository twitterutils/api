var promise = require("the-promise-factory");
var async = require("async");
var _ = require("underscore");

module.exports = function(graphDataService, changesDataService, userIdHelper) {
    return {
        getAllIdsFor: function(users) {
            return promise.create((fulfill, reject) => {
                async.concat(
                    users,
                    extractUserIds,
                    (err, idsForAllUsers) => {
                        if (err) return reject(err);

                        var result = _.flatten(idsForAllUsers);
                        result = _.uniq(result);

                        fulfill(result);
                    }
                );
            });
        }
    };

    function extractUserIds(user, callback){
        async.parallel({
            changesIds: extractChangesIds(user),
            graphIds: extractGraphIds(user)
        }, (err, result) => {
            if (err) return callback(err);

            var ids = userIdHelper.concatIds(
                result.graphIds, result.changesIds
            );

            callback(null, ids);
        })
    }

    function extractChangesIds(user){
        return (callback) => {
            async.waterfall([
                readUserChanges(user),
                readChangesIds
            ], (err, ids) => {
                if (err) return callback(err);

                callback(null, ids);
            });
        };
    }

    function extractGraphIds(user){
        return (callback) => {
            async.waterfall([
                readUserGraph(user),
                readGraphIds
            ], (err, ids) => {
                if (err) return callback(err);

                callback(null, ids);
            });
        };
    }

    function readUserChanges(user) {
        return (callback) => {
            changesDataService
                .userChanges(user.id)
                .then((changes) => {
                    callback(null, changes);
                }, callback);
        };
    }

    function readUserGraph(user) {
        return (callback) => {
            graphDataService
                .userDetails(user.id)
                .then((graph) => {
                    callback(null, graph);
                }, callback);
        };
    }

    function readChangesIds(changes, callback) {
        var ids = userIdHelper.getUserIdsFromChanges(changes);
        callback(null, ids);
    }

    function readGraphIds(graph, callback) {
        var ids = userIdHelper.getUserIdsFromGraph(graph);
        callback(null, ids);
    }
}