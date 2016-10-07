var _ = require("underscore");

module.exports = function(){
    return {
        determineAddedFriends: function(currentGraph, previousGraph){
            if (!previousGraph || !previousGraph.friends){
                return [];
            }

            return determineAdditions(currentGraph.friends, previousGraph.friends);
        },
        determineRemovedFriends: function(currentGraph, previousGraph){
            if (!previousGraph || !previousGraph.friends){
                return [];
            }

            return determineRemovals(currentGraph.friends, previousGraph.friends);
        },
        determineAddedFollowers: function(currentGraph, previousGraph){
            if (!previousGraph || !previousGraph.followers){
                return [];
            }

            return determineAdditions(currentGraph.followers, previousGraph.followers);
        },
        determineRemovedFollowers: function(currentGraph, previousGraph){
            if (!previousGraph || !previousGraph.followers){
                return [];
            }

            return determineRemovals(currentGraph.followers, previousGraph.followers);
        }
    };

    function determineRemovals(currentCollection, previousCollection){
        return getItemsFromCollection1NotInCollection2(previousCollection, currentCollection);
    }

    function determineAdditions(currentCollection, previousCollection){
        return getItemsFromCollection1NotInCollection2(currentCollection, previousCollection);
    }

    function getItemsFromCollection1NotInCollection2(collection1, collection2){
        return _.filter(collection1, function (item) {
            return !_.contains(collection2, item);
        });
    }
};