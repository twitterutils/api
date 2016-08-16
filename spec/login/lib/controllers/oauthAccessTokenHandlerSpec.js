var rfr = require("rfr");
var oauthAccessToken = rfr("login/lib/controllers/oauthAccessToken");

describe("oauthAccessToken", function(){
    var response = "seeded response";
    var db = "seeded db";
    var apiCallbackFactory = null;
    var apiCallback = null;
    var controller = null;
    var appUsers = null;

    beforeEach(function(){
        apiCallback = {
            success: () => {},
            error: () => {}
        };
        spyOn(apiCallback, "success");
        spyOn(apiCallback, "error");

        apiCallbackFactory = (res, callback) => {
            if (res === response && 
                callback === "auth request callback"){
                return apiCallback;
            }
        };

        appUsers = {
            first: function(){},
            create: function(){},
            updateCredentials: function(){}
        };
        var appUsersDataService = function(pDb){
            if (pDb === db){
                return appUsers;
            }
        }

        spyOn(console, "log");

        controller = oauthAccessToken(appUsersDataService, apiCallbackFactory);
    });

    it("calls the error callback when oauth failed", function(){
        controller.process(
            {api_callback: "auth request callback"},
            response, db, 
            {error: "seeded error"}
        );

        expect(apiCallback.error).toHaveBeenCalledWith(
            "Authorization error", "seeded error"
        );
    });

    it("searches the oauth userId", function(){
        spyOn(appUsers, "first").and.returnValue({
            then: (successCallback, errorCallback) => {}
        });

        controller.process(
            {api_callback: "auth request callback"},
            response, db, 
            {
                results: {
                    user_id: "twitter user"
                }
            }
        );

        expect(appUsers.first).toHaveBeenCalledWith("twitter user");
    });

    it("calls the error callback when the users could not be searched", function(){
        spyOn(appUsers, "first").and.returnValue({
            then: (successCallback, errorCallback) => {
                errorCallback("seeded error");
            }
        });

        controller.process(
            {api_callback: "auth request callback"},
            response, db, 
            {
                results: {
                    user_id: "twitter user"
                }
            }
        );

        expect(apiCallback.error).toHaveBeenCalledWith("Database Error", "seeded error");
    });

    it("inserts a new user when the authenticated one does not exist", function(){
        spyOn(appUsers, "first").and.returnValue({
            then: (successCallback, errorCallback) => {
                successCallback(null);
            }
        });
        spyOn(appUsers, "create").and.returnValue({
            then: (successCallback, errorCallback) => {}
        });

        controller.process(
            {api_callback: "auth request callback"},
            response, db, 
            {
                access_token: "token1",
                access_token_secret: "secret1",
                results: {
                    user_id: "twitter user",
                    screen_name: "@lolo"
                }
            }
        );

        expect(appUsers.create).toHaveBeenCalledWith({
            twitter_user_id: "twitter user",
            twitter_screen_name: "@lolo",
            oauth_access_token: "token1",
            oauth_access_token_secret: "secret1",
            disabled: false
        });
    });

    it("calls the callback error when user creation failed", function(){
        spyOn(appUsers, "first").and.returnValue({
            then: (successCallback, errorCallback) => {
                successCallback(null);
            }
        });
        spyOn(appUsers, "create").and.returnValue({
            then: (successCallback, errorCallback) => {
                errorCallback("seeded error");
            }
        });

        controller.process(
            {api_callback: "auth request callback"},
            response, db, 
            {results: {}}
        );

        expect(apiCallback.error).toHaveBeenCalledWith("Database Error", "seeded error");
    });

    it("calls the callback success when user creation succeeded", function(){
        spyOn(appUsers, "first").and.returnValue({
            then: (successCallback, errorCallback) => {
                successCallback(null);
            }
        });
        spyOn(appUsers, "create").and.returnValue({
            then: (successCallback, errorCallback) => {
                successCallback(null);
            }
        });

        controller.process(
            {api_callback: "auth request callback"},
            response, db, 
            {results: {
                user_id: "twitter user",
                screen_name: "@lolo"
            }}
        );

        expect(apiCallback.success).toHaveBeenCalledWith("twitter user", "@lolo");
        expect(console.log).toHaveBeenCalledWith("Authenticated User @lolo")
    });

    it("updates the credentials when the authenticated exists", function(){
        spyOn(appUsers, "first").and.returnValue({
            then: (successCallback, errorCallback) => {
                successCallback({});
            }
        });
        spyOn(appUsers, "updateCredentials").and.returnValue({
            then: (successCallback, errorCallback) => {}
        });

        controller.process(
            {api_callback: "auth request callback"},
            response, db, 
            {
                access_token: "token1",
                access_token_secret: "secret1",
                results: {
                    user_id: "twitter user",
                    screen_name: "@lolo"
                }
            }
        );

        expect(appUsers.updateCredentials).toHaveBeenCalledWith(
            "twitter user", {
                oauth_access_token: "token1",
                oauth_access_token_secret: "secret1"
            });
    });

    it("calls the callback error when credentials update fails", function(){
        spyOn(appUsers, "first").and.returnValue({
            then: (successCallback, errorCallback) => {
                successCallback({});
            }
        });
        spyOn(appUsers, "updateCredentials").and.returnValue({
            then: (successCallback, errorCallback) => {
                errorCallback("seeded error");
            }
        });

        controller.process(
            {api_callback: "auth request callback"},
            response, db, 
            {
                access_token: "token1",
                access_token_secret: "secret1",
                results: {
                    user_id: "twitter user",
                    screen_name: "@lolo"
                }
            }
        );

        expect(apiCallback.error).toHaveBeenCalledWith("Database Error", "seeded error");
    });

    it("calls the callback success when credentials update succeeds", function(){
        spyOn(appUsers, "first").and.returnValue({
            then: (successCallback, errorCallback) => {
                successCallback({});
            }
        });
        spyOn(appUsers, "updateCredentials").and.returnValue({
            then: (successCallback, errorCallback) => {
                successCallback(null);
            }
        });

        controller.process(
            {api_callback: "auth request callback"},
            response, db, 
            {
                access_token: "token1",
                access_token_secret: "secret1",
                results: {
                    user_id: "twitter user",
                    screen_name: "@lolo"
                }
            }
        );

        expect(apiCallback.success).toHaveBeenCalledWith("twitter user", "@lolo");
        expect(console.log).toHaveBeenCalledWith("Authenticated User @lolo")
    });
});