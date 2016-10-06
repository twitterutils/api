var rfr = require("rfr");
var webError = rfr("lib/webApiError.js");

describe("webError", function(){
    var responseCode = null;
    var responseBody = null;
    var responseStub = null;

    beforeEach(function(){
        responseCode = null;
        responseBody = null;

        responseStub = {
            status: function(code){
                responseCode = code;
                return this;
            },
            send: function(str){
                responseBody = str;
                return this;
            }
        };

        spyOn(console, "error");
    });

    describe("unexpected", function(){
        var errorResult = null;
        var seededError = null;

        beforeEach(function(){
            seededError = {stack: "errorStack"};

            errorResult = webError.unexpected(
                responseStub, "error message", seededError
            );
        });

        it("sets the status code", function(){
            expect(responseCode).toBe(500);
        });

        it("sends the response body", function(){
            expect(responseBody).toEqual({error: "error message"});
        });

        it("returns the provided response", function(){
            expect(errorResult).toBe(responseStub);
        });

        it("properly logs the error", function(){
            expect(console.error).toHaveBeenCalledWith(seededError, "errorStack");
        });

        describe("when no error is provided", function(){
            beforeEach(function(){
                errorResult = webError.unexpected(
                    responseStub, "error message"
                );
            });

            it("sets the status code", function(){
                expect(responseCode).toBe(500);
            });

            it("sends the response body", function(){
                expect(responseBody).toEqual({error: "error message"});
            });

            it("returns the provided response", function(){
                expect(errorResult).toBe(responseStub);
            });
        });
    });

    describe("unauthorized", function(){
        var errorResult = null;

        beforeEach(function(){
            errorResult = webError.unauthorized(
                responseStub, "unauthorized error"
            );
        });

        it("sets the status code", function(){
            expect(responseCode).toBe(401);
        });

        it("sends the response body", function(){
            expect(responseBody).toEqual({error: "unauthorized error"});
        });

        it("returns the provided response", function(){
            expect(errorResult).toBe(responseStub);
        });

        it("properly logs the error", function(){
            expect(console.error).toHaveBeenCalledWith("unauthorized error");
        });
    });

    describe("notFound", function(){
        var errorResult = null;

        beforeEach(function(){
            errorResult = webError.notFound(
                responseStub, "not found error"
            );
        });

        it("sets the status code", function(){
            expect(responseCode).toBe(404);
        });

        it("sends the response body", function(){
            expect(responseBody).toEqual({error: "not found error"});
        });

        it("returns the provided response", function(){
            expect(errorResult).toBe(responseStub);
        });

        it("properly logs the error", function(){
            expect(console.error).toHaveBeenCalledWith("not found error");
        });
    });

    it("logsError", function(){
        var seededError = {stack: "errorStack"};

        webError.logError(seededError);

        expect(console.error).toHaveBeenCalledWith(seededError, "errorStack");
    });
});
