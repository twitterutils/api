var _ = require("underscore");

module.exports = function () {
    return {
        extractIds: function(notifications){
            notifications = notifications || [];

            var originatorIds = notifications.map((n) => {
                return n.userId;
            });

            var unfollowedIds = notifications.filter((n) => {
                return n.type === "unfollow";
            }).map((n) => {
                return n.details.target;
            });

            var result = []
                .concat(originatorIds)
                .concat(unfollowedIds);

            return _.uniq(result);
        },
        toDictionary: function(usernames){
            usernames = usernames || [];

            var result = {};

            usernames.forEach((u) => {
                result[u.userId] = u;
            });

            return result;
        }
    }
}