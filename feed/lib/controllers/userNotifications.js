module.exports = function (apiKey, webError) {
    return {
        recent: function(userId, maxCount, reqApiKey, response){
            webError.unauthorized(response, "Unauthorized");
        }
    }
}