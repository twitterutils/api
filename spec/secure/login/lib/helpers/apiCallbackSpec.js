var rfr = require("rfr");
var apiCallback = rfr("secure/login/lib/helpers/apiCallback");

describe("apiCallback", function(){
    var responseStub = null;
    var redirectUrl = null;
    var callback = null;

    beforeEach(function(){
        redirectUrl = null;

        responseStub = {
            redirect: function(url){
                redirectUrl = url;
                return this;
            }
        };

        spyOn(console, "error");
        spyOn(console, "log");
    });

    describe("callback has no query string parameters", function(){
        beforeEach(function(){
            callback = apiCallback(responseStub, "callback_url");
        });

        it("success redirects to the correct url", function(){
            var actualResult = callback.success("myuser", "pepin");

            expect(actualResult).toBe(responseStub);
            expect(redirectUrl).toBe("callback_url?user_id=myuser&screen_name=pepin")
        });

        it("error redirects to the correct url", function(){
            var seededError = {stack: "errorStack"};

            var actualResult = callback.error("authentication_error", seededError);

            expect(actualResult).toBe(responseStub);
            expect(redirectUrl).toBe("callback_url?error=authentication_error")
            expect(console.error).toHaveBeenCalledWith(seededError, "errorStack");
        });

        it("error redirects to the correct url even when no error is provided", function(){
            var actualResult = callback.error("forced_error");

            expect(actualResult).toBe(responseStub);
            expect(redirectUrl).toBe("callback_url?error=forced_error")
        });
    });

    describe("callback has query string parameters", function(){
        beforeEach(function(){
            callback = apiCallback(responseStub, "callback_url?val=true");
        });

        it("success redirects to the correct url", function(){
            var actualResult = callback.success("myuser");

            expect(actualResult).toBe(responseStub);
            expect(redirectUrl).toBe("callback_url?val=true&user_id=myuser")
        });

        it("error redirects to the correct url", function(){
            var actualResult = callback.error("forced_error");

            expect(actualResult).toBe(responseStub);
            expect(redirectUrl).toBe("callback_url?val=true&error=forced_error")
        });
    });
});
