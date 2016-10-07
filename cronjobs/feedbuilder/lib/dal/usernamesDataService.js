var promise = require("the-promise-factory");
var requestModule = require("request");

module.exports = function(request) {
    if (!request){
        request = requestModule;
    }

    return {
        find: function(userIds){
            return promise.create((fulfill, reject) => {
                var requestInfo = buildApiRequest("find/" + (userIds || []).join(","));

                request(
                    requestInfo, 
                    (error, response, body) => {
                        if (error) return reject(error);
                        if (response.statusCode !== 200) return reject("Invalid response Code");

                        var result = parseBody(body);

                        console.log("usernamesDataService.find", 
                            "requestLength", (userIds || []).length,
                            "responseLength", (result || []).length
                        );

                        fulfill(result);
                    });
            });
        }
    };

    function buildApiRequest(methodAndParameters){
        var result = {
            headers: {
                'Authorization': process.env.TWU_CRON_USERNAMES_API_KEY
            },
            url: process.env.TWU_CRON_USERNAMES_API_BASE_URL + "/secure/usernames/api/v1/" + methodAndParameters +"/"
        };

        console.log("usernamesDataService.url", result.url);

        return result;
    }

    function parseBody(body){
        return JSON
            .parse(body)
            .map((n) => {
                return {
                    userId: n.userId,
                    userName: n.userName
                };
            });
        return body;
    }
}