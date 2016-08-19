var OAuth = require("oauth").OAuth;

module.exports = {
    create: function(authRequestId){
        var urlAddendum = "";
        if (authRequestId){
            urlAddendum = `/${authRequestId}/`
        }

        var callbackUrl = `${process.env.TWITTER_CALLBACK_BASE}/login/api/v1/auth/twitter_callback${urlAddendum}`;

        return new OAuth(
            "https://api.twitter.com/oauth/request_token",
            "https://api.twitter.com/oauth/access_token",
            process.env.TWITTER_CONSUMER_KEY,
            process.env.TWITTER_CONSUMER_SECRET,
            "1.0",
            callbackUrl,
            "HMAC-SHA1"
        );
    }
};

