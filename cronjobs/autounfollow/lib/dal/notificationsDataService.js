var rfr = require("rfr");
var postRequestHelper = rfr("lib/helpers/postRequestHelper");

module.exports = function (request) {
    return {
        send: function(notificationType, userId, notificationDetails){
            return postRequestHelper(request).send(
                process.env.TWU_CRON_NOTIFICATIONS_API_BASE_URL + "/secure/notifications/api/v1/send/",
                process.env.TWU_CRON_NOTIFICATIONS_API_KEY,
                {
                    'type': notificationType,
                    'userid': userId.toString(),
                    'details': notificationDetails
                }
            );
        }
    }
}