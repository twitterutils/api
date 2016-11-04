var promise = require("the-promise-factory");
var requestModule = require("request");

module.exports = function(request) {
    if (!request){
        request = requestModule;
    }

    return {
        recentNotifications: function(userId){
            return promise.create((fulfill, reject) => {
                var requestInfo = buildApiRequest("recentnotifications/" + userId.toString());

                request(
                    requestInfo, 
                    (error, response, body) => {
                        if (error) return reject(error);
                        if (response.statusCode !== 200) return reject(`Invalid response Code ${response.statusCode}`);

                        var result = parseBody(body);

                        fulfill(result);
                    });
            });
        }
    };

    function buildApiRequest(methodAndParameters){
        var result = {
            headers: {
                'Authorization': process.env.TWU_CRON_NOTIFICATIONS_API_KEY
            },
            url: process.env.TWU_CRON_NOTIFICATIONS_API_BASE_URL + "/secure/feed/api/v1/" + methodAndParameters +"/"
        };

        console.log("notificationsDataService.url", result.url);

        return result;
    }

    function parseBody(body){
        return JSON
            .parse(body)
            .map((n) => {
                return {
                    id: n.id,
                    type: n.type,
                    userId: n.userId,
                    details: n.details,
                    creation_time_str: n.creation_time_str
                };
            });
    }
}