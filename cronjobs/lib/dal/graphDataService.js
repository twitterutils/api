var promise = require("the-promise-factory");
var requestModule = require("request");

module.exports = function(request) {
    if (!request){
        request = requestModule;
    }

    return {
        userDetails: function(userId){
            return promise.create((fulfill, reject) => {
                var requestInfo = buildApiRequest("user/" + userId);

                request(requestInfo, handleResponse(fulfill, reject, parseUserDetails));
            });
        },
        userChanges: function(userId){
            return promise.create((fulfill, reject) => {
                var requestInfo = buildApiRequest("changes/" + userId);

                request(requestInfo, handleChangesResponse(fulfill, reject));
            });
        },
        recentChanges: function(graphId){
            return promise.create((fulfill, reject) => {
                var requestInfo = buildApiRequest("recentchanges/" + graphId);

                request(requestInfo, handleChangesResponse(fulfill, reject));
            });
        }
    };

    function buildApiRequest(methodAndParameters){
        return {
            headers: {
                'Authorization': process.env.TWU_CRON_GRAPH_API_KEY
            },
            url: process.env.TWU_CRON_GRAPH_API_BASE_URL + "/secure/graph/api/v1/" + methodAndParameters +"/"
        };
    }

    function handleChangesResponse(fulfill, reject){
        return handleResponse(fulfill, reject, parseChanges);
    }

    function handleResponse(fulfill, reject, parseBody){
        return (error, response, body) => {
            if (error) return reject(error);
            if (response.statusCode !== 200) return reject(`Invalid response Code ${response.statusCode}`);

            var result = parseBody(body);

            fulfill(result);
        };
    }

    function parseChanges(body){
        return JSON.parse(body)
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

    function parseUserDetails(body){
        var rawResult = JSON.parse(body);
        return {
            id: rawResult.id,
            graphId: rawResult.graphId,
            userName: rawResult.userName,
            friends: rawResult.friends,
            followers: rawResult.followers
        };
    }
}