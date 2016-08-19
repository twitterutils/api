var rfr = require("rfr");
var oauthFactory = rfr("secure/login/lib/factories/oauth");

describe("oauth", function(){
    beforeEach(function() {
        process.env.TWITTER_CALLBACK_BASE = "tcb";
    });

    afterEach(function() {
        process.env.TWITTER_CALLBACK_BASE = null;
    });

    it("should have the correct TWITTER_CALLBACK_BASE", function(){
        expect(process.env.TWITTER_CALLBACK_BASE).toBe("tcb");
    });

    describe("when there's no auth_request_id", function(){
        it ("creates a client with the correct callback", function(){
            expect(oauthFactory.create()._authorize_callback).toBe("tcb/login/api/v1/auth/twitter_callback");
        });
    });

    describe("when there's an auth_request_id", function(){
        it ("creates a client with the correct callback", function(){
            expect(oauthFactory.create("uniqueid")._authorize_callback).toBe("tcb/login/api/v1/auth/twitter_callback/uniqueid/");
        });
    });
});