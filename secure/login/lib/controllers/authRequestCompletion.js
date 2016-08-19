module.exports = function(oauth, dbConnection3,
    authRequestsDataService2, webError, oauthTokenHandler) {
    return {
        process: (authRequestId, oauth_verifier, response) => {
            if (!authRequestId) return webError.notFound(response, "AuthRequestId not provided");

            dbConnection3(response, "LOGIN_DB_CONNECTION_STRING").then(processOauthCallback);

            function processOauthCallback(db){
                authRequestsDataService2(db)
                    .first(authRequestId)
                    .then((authRequest) => {
                        if (!authRequest) return webError.notFound(response, "AuthRequest not found");

                        deleteAuthRequest(db);
                        processAuthRequest(db, authRequest);
                    }, (err) => {
                        webError.unexpected(response, "Error looking for AuthRequest", err);
                    });
            }

            function deleteAuthRequest(db){
                authRequestsDataService2(db)
                    .delete(authRequestId)
                    .then(null, (err) => {
                        webError.logError(err);
                    });
            }

            function processAuthRequest(db, authRequest){
                oauth.create().getOAuthAccessToken(
                    authRequest.oauth_token,
                    authRequest.oauth_token_secret,
                    oauth_verifier,
                    (error, oauth_access_token, oauth_access_token_secret, results) => {
                        var oauthInfo = {
                            error: error,
                            access_token: oauth_access_token,
                            access_token_secret: oauth_access_token_secret,
                            results: results
                        };
                        oauthTokenHandler.process(authRequest, response, db, oauthInfo);
                    }
                );
            }
        }
    };
}