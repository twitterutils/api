var promise = require("the-promise-factory");
var requestModule = require("request");

module.exports = function(request) {
    if (!request){
        request = requestModule;
    }

    return {
        userChanges: function(userId){
            return promise.create((fulfill, reject) => {
                var requestInfo = buildApiRequest("changes/" + userId.toString());

                request(
                    requestInfo, 
                    (error, response, body) => {
                        if (error) return reject(error);
                        if (response.statusCode !== 200) return reject("Invalid response Code");

                        var result = parseBody(body);

                        fulfill(result);
                    });
            });
        }
    };

    function buildApiRequest(methodAndParameters){
        var result = {
            headers: {
                'Authorization': process.env.TWU_CRON_GRAPH_API_KEY
            },
            url: process.env.TWU_CRON_GRAPH_API_BASE_URL + "/secure/graph/api/v1/" + methodAndParameters +"/"
        };

        console.log("notificationsDataService.url", result.url);

        return result;
    }

    function parseBody(body){
        return JSON
            .parse(body)
            .map((change) => {
                return {
                    type: change.type,
                    originator: change.originator,
                    target: change.target,
                    prevId: change.prevId,
                    currId: change.currId
                };
            });
    }
}