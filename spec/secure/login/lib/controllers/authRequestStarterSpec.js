var rfr = require("rfr");
var authRequestStarterFactory = rfr("secure/login/lib/controllers/authRequestStarter");

describe("authRequestStarter", function(){
    var res = {
        name: "my web response",
        redirect: function(){}
    };
    var db = "my db";
    var webError = null;
    var controller = null;
    var oauth = null;
    var authRequestsDataService = null;

    beforeEach(function(){
        spyOn(res, "redirect");
        spyOn(console, "log");

        webError = {
            unauthorized: function(){},
            unexpected: function(){},
            notFound: function(){}
        };
        spyOn(webError, "unauthorized");
        spyOn(webError, "unexpected");
        spyOn(webError, "notFound");

        var shortId = {
            generate: () => { return "unique id"; }
        }

        oauth = {
            getOAuthRequestToken: function(){}
        }
        var oauthFactory = {
            create: (id) => {
                if (id === "unique id"){
                    return oauth;
                }
            }
        };

        var dbConnectionFactory = (r, dbConnectionKey) => {
            if (dbConnectionKey === "LOGIN_DB_CONNECTION_STRING" && r === res){
                return {
                    then: (successCallback) => {
                        successCallback(db);
                    }
                };
            }
        };

        authRequestsDataService = {
            create: function(){}
        };

        var authRequestFactory = (pDb) => {
            if (pDb === db){
                return authRequestsDataService;
            }
        }

        controller = authRequestStarterFactory(dbConnectionFactory, authRequestFactory, oauthFactory, webError, shortId);
    });

    it("returns not found when no callback is provided", function(){
        controller.process(null, res);

        expect(webError.notFound).toHaveBeenCalledWith(res, "No callback provided");
    });

    it("requests the oauth token", function(){
        spyOn(oauth, "getOAuthRequestToken");

        controller.process("my callback", res);

        expect(webError.notFound).not.toHaveBeenCalled();
        expect(oauth.getOAuthRequestToken).toHaveBeenCalled();
    });

    it("returns unexpected when token request failed", function(){
        spyOn(oauth, "getOAuthRequestToken").and.callFake((completionCallback) => {
            completionCallback("seeded error");
        });

        controller.process("my callback", res);

        expect(webError.unexpected).toHaveBeenCalledWith(res, "Authentication Failed", "seeded error");
    });

    it("saves the oauth info", function(){
        spyOn(oauth, "getOAuthRequestToken").and.callFake((completionCallback) => {
            completionCallback(null, "token", "secret");
        });
        spyOn(authRequestsDataService, "create").and.returnValue({then: () => {}});

        controller.process("my callback", res);

        expect(authRequestsDataService.create).toHaveBeenCalledWith({
            _id: "unique id",
            oauth_token: "token",
            oauth_token_secret: "secret",
            api_callback: "my callback"
        });
    });

    it("returns unexpected when authRequest could not be created", function(){
        spyOn(oauth, "getOAuthRequestToken").and.callFake((completionCallback) => {
            completionCallback(null, "token", "secret");
        });
        spyOn(authRequestsDataService, "create").and.returnValue({
            then: (successCallback, errorCallback) => {
                errorCallback("seeded error");
            }
        });

        controller.process("my callback", res);

        expect(webError.unexpected).toHaveBeenCalledWith(res, "Db Storage Failed", "seeded error");
    });

    it("redirects to twitter on authRequest creation success", function(){
        spyOn(oauth, "getOAuthRequestToken").and.callFake((completionCallback) => {
            completionCallback(null, "token", "secret");
        });
        spyOn(authRequestsDataService, "create").and.returnValue({
            then: (successCallback, errorCallback) => {
                successCallback();
            }
        });

        controller.process("my callback", res);

        expect(res.redirect).toHaveBeenCalledWith(
            "https://twitter.com/oauth/authorize?oauth_token=token"
        );
        expect(console.log).toHaveBeenCalledWith(
            "Redirecting to https://twitter.com/oauth/authorize?oauth_token=token"
        );
    });
});