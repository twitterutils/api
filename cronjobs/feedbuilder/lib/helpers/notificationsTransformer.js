var rfr = require("rfr");
var userIdHelperModule = rfr("feedbuilder/lib/helpers/userIdHelper")();

module.exports = function (userIdHelper) {
    if (!userIdHelper) userIdHelper = userIdHelperModule;

    return {
        transform: function(usernames, notifications){
            var usernamesDict = userIdHelper.toDictionary(usernames);

            return notifications.map((n) => {
                var result = JSON.parse(JSON.stringify(n));

                result.userName = usernamesDict[n.userId].userName;
                result.url = "https://twitter.com/@" + result.userName;

                if (n.type === "unfollow"){
                    result.details.userName = usernamesDict[n.details.target].userName;
                    result.details.url = "https://twitter.com/@" + result.details.userName;
                }

                result.creation_time_str = n.creation_time_str;

                return result;
            })
        }
    }
}