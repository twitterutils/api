module.exports = function(dbConnection3, appUsersDataService, apiKey, webError){
    return {
        all: (reqApiKey, response) => {
            if (!apiKey.isValid(reqApiKey)){
                webError.unauthorized(response, "Unauthorized");
                return;
            }

            dbConnection3(response, "TWU_API_LOGIN_DB_CONNECTION_STRING")
                .then((db) => {
                    appUsersDataService(db)
                        .all({disabled: false})
                        .then((dbUsers) => {
                            response.send(dbUsers);
                        }, (err) => {
                            webError.unexpected(response, "Db Error finding users", err);
                        });
                });
        },
        details: (userId, reqApiKey, response) => {
            if (!apiKey.isValid(reqApiKey)){
                webError.unauthorized(response, "Unauthorized");
                return;
            }

            dbConnection3(response, "TWU_API_LOGIN_DB_CONNECTION_STRING")
                .then((db) => {
                    appUsersDataService(db)
                        .first(userId)
                        .then((user) => {
                            if (!user){
                                webError.notFound(response, "User not found");
                                return;
                            }

                            response.send({
                                oauth_access_token: user.oauth_access_token,
                                oauth_access_token_secret: user.oauth_access_token_secret
                            });
                        }, (err) => {
                            webError.unexpected(response, "Db Error finding users", err);
                        });
                });
        },
        disable: (userId, reqApiKey, response) => {
            if (!apiKey.isValid(reqApiKey)){
                webError.unauthorized(response, "Unauthorized");
                return;
            }

            dbConnection3(response, "TWU_API_LOGIN_DB_CONNECTION_STRING")
                .then((db) => {
                    appUsersDataService(db)
                        .updateCredentials(userId, {disabled: true})
                        .then(() => {
                            response.send({success: true });
                        }, (err) => {
                            webError.unexpected(response, "Db Error updating users", err);
                        });
                });
        }
    };
};