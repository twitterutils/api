var rfr = require("rfr");
var controller = rfr("login/lib/controllers/authRequestCompletion");

describe("authRequestCompletion", function(){
    var response = "web Response";
    var db = "database";
    var webError = null;
    var dbConnectionFactory = null;
    var authRequestsFactory = null;
    var authRequests = null;
    var oauth = null;
    var oauthFactory = null;

    beforeEach(function(){
        webError = {
            notFound: function(){},
            unexpected: function(){},
            logError: function(){}
        };

        spyOn(webError, "notFound");
        spyOn(webError, "unexpected");
        spyOn(webError, "logError");

        dbConnectionFactory = function(res, dbConnectionKey){
            if (dbConnectionKey === "LOGIN_DB_CONNECTION_STRING" &&
                res === response){
                return {
                    then: function(callback){
                        callback(db);
                    }
                }
            }
        };

        authRequests = {
            first: function(){},
            delete: function(){}
        };
        authRequestsFactory = function(someDb){
            if (someDb === db){
                return authRequests;
            }
        }

        oauthFactory = {
            getOAuthAccessToken: () => {}
        };
        oauth = {
            create: () => {
                return oauthFactory;
            }
        };
    });

    it("returns not found when authRequestId is not provided", function(){
        controller(null, null, null, webError)
            .process(null, null, response);

        expect(webError.notFound).toHaveBeenCalledWith("web Response", "AuthRequestId not provided");
    });

    it("creates an authRequest", function(){
        spyOn(authRequests, "first").and.returnValue({
            then: function(){}
        });

        controller(null, dbConnectionFactory, authRequestsFactory, webError)
            .process("my id", null, response);

        expect(authRequests.first).toHaveBeenCalledWith("my id");
    });

    it("returns unexpected when authRequest could not be created", function(){
        spyOn(authRequests, "first").and.returnValue({
            then: function(successCallback, errorCallback){
                errorCallback("seeded error");
            }
        });

        controller(null, dbConnectionFactory, authRequestsFactory, webError)
            .process("my id", null, response);

        expect(webError.unexpected).toHaveBeenCalledWith("web Response", "Error looking for AuthRequest", "seeded error");
    });

    it("returns not found when authRequest could not be found", function(){
        spyOn(authRequests, "first").and.returnValue({
            then: function(successCallback, errorCallback){
                successCallback(null);
            }
        });

        controller(null, dbConnectionFactory, authRequestsFactory, webError)
            .process("my id", null, response);

        expect(webError.notFound).toHaveBeenCalledWith("web Response", "AuthRequest not found");
    });

    it("deletes the authRequest", function(){
        spyOn(authRequests, "first").and.returnValue({
            then: function(successCallback, errorCallback){
                successCallback({});
            }
        });
        spyOn(authRequests, "delete").and.returnValue({then: (successCallback, errorCallback) => {}});

        controller(oauth, dbConnectionFactory, authRequestsFactory, webError)
            .process("my id", null, response);

        expect(authRequests.delete).toHaveBeenCalledWith("my id");
    });

    it("logs any deletion error", function(){
        spyOn(authRequests, "first").and.returnValue({
            then: function(successCallback, errorCallback){
                successCallback({});
            }
        });
        spyOn(authRequests, "delete").and.returnValue({
            then: (successCallback, errorCallback) => { errorCallback("my error")}
        });

        controller(oauth, dbConnectionFactory, authRequestsFactory, webError)
            .process("my id", null, response);

        expect(webError.logError).toHaveBeenCalledWith("my error");
    });

    it("invokes the oauth token handler with the oauthInfo", function(){
        var seededAuthRequest = {
                    oauth_token: "the token",
                    oauth_token_secret: "super secret",
                    api_callback: "my callback"
        };
        spyOn(authRequests, "first").and.returnValue({
            then: (successCallback, errorCallback) => {
                successCallback(seededAuthRequest);
            }
        });
        spyOn(authRequests, "delete").and.returnValue({then: (successCallback, errorCallback) => {}});
        spyOn(oauthFactory, "getOAuthAccessToken").and.callFake(
            (oauth_token, oauth_token_secret, oauth_verifier, callback) => {
                if (oauth_token === "the token" &&
                    oauth_token_secret === "super secret" && 
                    oauth_verifier === "oauth_verifier"){
                    callback(
                        "seeded error",
                        "seeded access token",
                        "seeded access token secret",
                        "seeded result"
                    );
                }
            });
        var oauthTokenHandler = { process: () => {} };
        spyOn(oauthTokenHandler, "process");

        controller(oauth, dbConnectionFactory, authRequestsFactory, webError, oauthTokenHandler)
            .process("my id", "oauth_verifier", response);

        expect(oauthTokenHandler.process).toHaveBeenCalledWith(
            seededAuthRequest,
            response,
            db,
            {
                error: "seeded error",
                access_token: "seeded access token",
                access_token_secret: "seeded access token secret",
                results: "seeded result"
            });
    });
});