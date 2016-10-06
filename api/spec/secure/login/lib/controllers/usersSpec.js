var rfr = require("rfr");
var usersController = rfr("secure/login/lib/controllers/users");

describe("users", function(){
    var res = {
        name: "my web response",
        send: () => {}
    };
    var db = "my database";
    var controller = null;
    var webError = null;
    var appUsers = null;

    beforeEach(function(){
        spyOn(res, "send");

        webError = {
            unauthorized: function(){},
            unexpected: function(){},
            notFound: function(){}
        };
        spyOn(webError, "unauthorized");
        spyOn(webError, "unexpected");
        spyOn(webError, "notFound");

        var apiKey = {
            isValid: (key) => {
                return key === "my secret key";
            }
        };

        var dbConnection = (r, dbConnectionKey) => {
            if (dbConnectionKey === "TWU_API_LOGIN_DB_CONNECTION_STRING" && r === res){
                return {
                    then: (successCallback, errorCallback) =>{
                        successCallback(db);
                    }
                };
            }
        };

        appUsers = {
            all: function(){},
            first: function(){},
            updateCredentials: function(){}
        };
        var appUsersFactory = (pDb) => {
            if (pDb === db){
                return appUsers;
            }
        };

        controller = usersController(dbConnection, appUsersFactory, apiKey, webError);
    });

    describe("all", function(){
        it("returns unauthorized when the api key is invalid", function(){
            controller.all("invalid key", res);

            expect(webError.unauthorized).toHaveBeenCalledWith(res, "Unauthorized");
        });

        it("returns unexpected when users could not be read", function(){
            spyOn(appUsers, "all").and.returnValue({
                then: (successCallback, errorCallback) => {
                    errorCallback("seeded error");
                }
            });

            controller.all("my secret key", res);

            expect(webError.unexpected).toHaveBeenCalledWith(
                res, "Db Error finding users", "seeded error"
            );
        });

        it("returns the users", function(){
            spyOn(appUsers, "all").and.returnValue({
                then: (successCallback, errorCallback) => {
                    successCallback("all my users");
                }
            });

            controller.all("my secret key", res);

            expect(res.send).toHaveBeenCalledWith("all my users");
        });

        it("reads only the enabled users", function(){
            var filteredUsersQuery = null;
            spyOn(appUsers, "all").and.callFake((query) => {
                filteredUsersQuery = query;
                return {
                    then: (successCallback, errorCallback) => {
                        successCallback("all my users");
                    }
                };
            });

            controller.all("my secret key", res);

            expect(filteredUsersQuery).toEqual({disabled: false});
        });
    });

    describe("details", function(){
        it("returns unauthorized when the api key is invalid", function(){
            controller.details("my user", "invalid key", res);

            expect(webError.unauthorized).toHaveBeenCalledWith(res, "Unauthorized");
        });

        it("returns unexpected when users could not be read", function(){
            spyOn(appUsers, "first").and.callFake((userId) => {
                if (userId === "my user"){
                    return {
                        then: (successCallback, errorCallback) => {
                            errorCallback("seeded error");
                        }
                    };
                }
            });

            controller.details("my user", "my secret key", res);

            expect(webError.unexpected).toHaveBeenCalledWith(
                res, "Db Error finding users", "seeded error"
            );
        });

        it("returns notfound when the user could not be found", function(){
            spyOn(appUsers, "first").and.callFake((userId) => {
                if (userId === "my user"){
                    return {
                        then: (successCallback, errorCallback) => {
                            successCallback(null);
                        }
                    };
                }
            });

            controller.details("my user", "my secret key", res);

            expect(webError.notFound).toHaveBeenCalledWith(
                res, "User not found"
            );
        });

        it("returns the user oauth credentials", function(){
            spyOn(appUsers, "first").and.callFake((userId) => {
                if (userId === "my user"){
                    return {
                        then: (successCallback, errorCallback) => {
                            successCallback({
                                oauth_access_token: "my token",
                                oauth_access_token_secret: "my secret"
                            });
                        }
                    };
                }
            });

            controller.details("my user", "my secret key", res);

            expect(res.send).toHaveBeenCalledWith({
                oauth_access_token: "my token",
                oauth_access_token_secret: "my secret"
            });
        });
    });

    describe("disable", function(){
        it("returns unauthorized when the api key is invalid", function(){
            controller.disable("my user", "invalid key", res);

            expect(webError.unauthorized).toHaveBeenCalledWith(res, "Unauthorized");
        });

        it("disables the correct user", function(){
            var disableParams = null;

            spyOn(appUsers, "updateCredentials").and.callFake((userId, credentials) => {
                disableParams = {
                    userId: userId,
                    credentials: credentials
                };
                return {
                    then: (successCallback, errorCallback) => {
                        successCallback(null);
                    }
                };
            });

            controller.disable("my user", "my secret key", res);

            expect(disableParams).toEqual({
                userId: "my user",
                credentials: {
                    disabled: true
                }
            });
        });

        it("returns success when user was disabled", function(){
            spyOn(appUsers, "updateCredentials").and.callFake((userId, credentials) => {
                return {
                    then: (successCallback, errorCallback) => {
                        successCallback(null);
                    }
                };
            });

            controller.disable("my user", "my secret key", res);

            expect(res.send).toHaveBeenCalledWith({
                success: true
            });
        });

        it("returns unexpected when user could not be disabled", function(){
            spyOn(appUsers, "updateCredentials").and.callFake((userId, credentials) => {
                return {
                    then: (successCallback, errorCallback) => {
                        errorCallback("seeded error");
                    }
                };
            });

            controller.disable("my user", "my secret key", res);

            expect(webError.unexpected).toHaveBeenCalledWith(
                res, "Db Error updating users", "seeded error"
            );
        });
    })
});
