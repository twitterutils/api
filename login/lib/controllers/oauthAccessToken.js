var rfr = require("rfr");
var apiCallbackFactory = rfr("login/lib/helpers/apiCallback");

module.exports = function(appUsersDataService, apiCallback) {
    if (!apiCallback) apiCallback = apiCallbackFactory;

    return {
        process: function(authRequest, httpResponse, db, oauthResponseInfo){
            var callback = apiCallback(httpResponse, authRequest.api_callback);

            if (oauthResponseInfo.error){
                callback.error("Authorization error", oauthResponseInfo.error);
                return;
            }

            var userInfo = oauthResponseInfo.results;

            appUsersDataService(db)
                .first(userInfo.user_id)
                .then((appUser) => {
                    if (!appUser){
                        createNewUser();
                    }
                    else{
                        updateExistingUser();
                    }
                }, databaseError);

            function createNewUser(){
                appUsersDataService(db)
                    .create({
                        twitter_user_id: userInfo.user_id,
                        twitter_screen_name: userInfo.screen_name,
                        oauth_access_token: oauthResponseInfo.access_token,
                        oauth_access_token_secret: oauthResponseInfo.access_token_secret,
                        disabled: false
                    })
                    .then(authenticationSuccess, databaseError);
            }

            function updateExistingUser(){
                var credentials = {
                    oauth_access_token: oauthResponseInfo.access_token,
                    oauth_access_token_secret: oauthResponseInfo.access_token_secret
                };

                appUsersDataService(db)
                    .updateCredentials(userInfo.user_id, credentials)
                    .then(authenticationSuccess, databaseError);
            }

            function authenticationSuccess(){
                console.log(`Authenticated User ${userInfo.screen_name}`);
                callback.success(userInfo.user_id, userInfo.screen_name);
            }

            function databaseError(err){
                callback.error("Database Error", err);
            }
        }
    };
}