module.exports = function (apiKey, webError) {
    return {
        recent: function(userId, maxCount, reqApiKey, response){
            webError.unauthorized(response, "Unauthorized");

            console.log(
                "recent notifications",
                "twitter_user_id", userId,
                "max_result_count", maxCount,
                "reqApiKey", reqApiKey
            );

            response.send([
                {id: 1, type: "unfollow"},
                {id: 2, type: "follow"},
                {id: 3, type: "unfollow"}
            ]);
        }
    }
}