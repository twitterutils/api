var rfr = require("rfr");
var requestModule = require("request");
var promise = require("the-promise-factory");
var postRequestHelper = rfr("lib/helpers/postRequestHelper");

module.exports = function(request) {
    if (!request){
        request = requestModule;
    }

    return {
        update: (userId) => {
            return postRequestHelper(request).send(
                process.env.TWU_CRON_SCHEDULE_API_BASE_URL + "/secure/schedule/api/v1/updateuser/",
                process.env.TWU_CRON_SCHEDULE_API_KEY,
                { 'userid': userId.toString() }
            );
        },
        read: () => {
            return promise.create((fulfill, reject) => {
                request(
                    buildReadRequestInfo(),
                    (error, response, body) => {
                        if (error) return reject(error);
                        if (response.statusCode !== 200) return reject(`Invalid response Code ${response.statusCode}`);

                        fulfill(JSON.parse(body));
                    }
                );
            });
        }
    };

    function buildReadRequestInfo(){
        var result = {
            headers: {
                'Authorization': process.env.TWU_CRON_SCHEDULE_API_KEY
            },
            url: process.env.TWU_CRON_SCHEDULE_API_BASE_URL + "/secure/schedule/api/v1/list/"
        };

        console.log("userScheduleDataService.url=", result.url)

        return result
    }
};