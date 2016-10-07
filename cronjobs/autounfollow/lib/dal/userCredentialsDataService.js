var promise = require("the-promise-factory");
var requestModule = require("request");

module.exports = function(request){
    if (!request){
        request = requestModule;
    }

    return {
        first: function(userId){
            var requestParams = {
                headers: {
                    'Authorization': process.env.TWU_CRON_LOGIN_API_KEY
                },
                url: process.env.TWU_CRON_LOGIN_API_BASE_URL + "/secure/login/api/v1/user/" + userId + "/"
            }

            return promise.create((fulfill, reject) => {
                request(requestParams, (error, response, body) => {
                    if (error) return reject(error);
                    if (response.statusCode !== 200) return reject("Invalid response Code");

                    var credentials = JSON.parse(body)
                    var result = {
                        id: userId,
                        oauth_access_token: credentials.oauth_access_token,
                        oauth_access_token_secret: credentials.oauth_access_token_secret
                    };

                    fulfill(result);
                });
            });
        }
    };
};