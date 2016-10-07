var _ = require("underscore");

module.exports = function() {
    return {
        getUserIdsFromGraph: function(graph){
            var result = [graph.id];
            result = result.concat(graph.friends || []);
            result = result.concat(graph.followers || []);

            result = result.map((id) => {
                return id.toString();
            });

            result = _.uniq(result);

            return result;
        },
        getUserIdsFromChanges: function(changes){
            changes = changes || [];

            var originatorIds = changes.map((ch) => {
                return ch.originator;
            });

            var targetIds = changes.map((ch) => {
                return ch.target;
            });

            var result = []
                .concat(originatorIds)
                .concat(targetIds)
                .filter((id) => {
                    if (id){
                        return true;
                    }
                    return false;
                });

            return _.uniq(result);
        },
        getMissingIds: function (allIds, dbIds){
            return _.filter(allIds, function (a) {
                return !_.contains(dbIds, a);
            });
        },
        buildBatches: function(ids, batchSize){
            return _
                .chain(ids)
                .groupBy(function(element, index){
                    return Math.floor(index / batchSize);
                })
                .toArray()
                .value();
        },
        extractIds: function(objects){
            return (objects || []).map((u) => {
                return u.id;
            });
        },
        concatIds: function(ids1, ids2){
            var result = []
                .concat(ids1)
                .concat(ids2)
                .filter((id) => {
                    if (id){
                        return true;
                    }
                    return false;
                });
            return _.uniq(result);
        }
    };
}