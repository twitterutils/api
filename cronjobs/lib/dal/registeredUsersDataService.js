var rfr = require("rfr");
var promise = require("the-promise-factory");
var requestModule = require("request");
var postRequestHelper = rfr("lib/helpers/postRequestHelper");

module.exports = function(request){
    if (!request){
        request = requestModule;
    }

    return {
        all: function(){
            var requestParams = {
                headers: {
                    'Authorization': process.env.TWU_CRON_LOGIN_API_KEY
                },
                url: process.env.TWU_CRON_LOGIN_API_BASE_URL + "/secure/login/api/v1/users/"
            };

            return promise.create((fulfill, reject) => {
                request(requestParams, (error, response, body) => {
                    if (error) return reject(error);
                    if (response.statusCode !== 200) return reject("Invalid response Code");

                    var result = JSON.parse(body)
                        .map((user) => {
                            return {
                                id: user.id,
                                userName: user.user_name
                            };
                        });

                    fulfill(result);
                });
            });
        },
        disable: function(userId){
            return postRequestHelper(request).send(
                process.env.TWU_CRON_LOGIN_API_BASE_URL + "/secure/login/api/v1/disable/",
                process.env.TWU_CRON_LOGIN_API_KEY,
                { 'userid': userId.toString() }
            );
        }
    };
};