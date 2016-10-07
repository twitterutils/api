var requestModule = require("request");
var promise = require("the-promise-factory");

module.exports = function(request){
    if (!request){
        request = requestModule;
    }

    return {
        send: (url, apiKey, body) => {
            var requestParams = {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': apiKey
                },
                url: url,
                json: body
            };

            return promise.create((fulfill, reject) => {
                request(requestParams, (error, response, body) => {
                    if (error) return reject(error);
                    if (response.statusCode !== 200) return reject("Invalid response Code");

                    fulfill(body);
                });
            });
        }
    }
}