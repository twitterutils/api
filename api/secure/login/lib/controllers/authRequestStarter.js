var shortidFactory = require("shortid");

module.exports = function (dbConnection3, authRequestsDataService2,
    oauthFactory, webError, shortid) {
    if (!shortid) shortid = shortidFactory;

    return {
        process: (authCallback, response) => {
            if (!authCallback){
                webError.notFound(response, "No callback provided");
                return;
            }

            var authRequestId = shortid.generate();
            oauthFactory
                .create(authRequestId)
                .getOAuthRequestToken((error, oauth_token, oauth_token_secret) => {
                    if (error) {
                        webError.unexpected(response, "Authentication Failed", error);
                        return;
                    }

                    dbConnection3(response, "TWU_API_LOGIN_DB_CONNECTION_STRING")
                        .then((db) => {
                            authRequestsDataService2(db)
                                .create({
                                    _id: authRequestId,
                                    oauth_token: oauth_token,
                                    oauth_token_secret: oauth_token_secret,
                                    api_callback: authCallback
                                })
                                .then(() => {
                                    var redirect_url = `https://twitter.com/oauth/authorize?oauth_token=${oauth_token}`;
                                    console.log(`Redirecting to ${redirect_url}`)
                                    response.redirect(redirect_url);
                                }, (err) => {
                                    webError.unexpected(response, "Db Storage Failed", err);
                                });
                        });
                });
        }
    };
};