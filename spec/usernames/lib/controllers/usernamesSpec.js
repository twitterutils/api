var rfr = require("rfr");
var usernamesController = rfr("usernames/lib/controllers/usernames");

describe("usernamesController", function () {
    var res = {
        name: "my web response",
        send: () => {}
    };
    var db = "my database";
    var controller = null;
    var usernamesDataService = null;

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
            if (dbConnectionKey === "USERNAMES_DB_CONNECTION_STRING" &&
                r === res){
                return {
                    then: (successCallback, errorCallback) =>{
                        successCallback(db);
                    }
                };
            }
        };

        usernamesDataService = {
            find: function(){}
        };
        var usernamesDataServiceFactory = (pDb) => {
            if (pDb === db){
                return usernamesDataService;
            }
        };

        controller = usernamesController(
            dbConnection,
            usernamesDataServiceFactory,
            apiKey,
            webError
        );
    });

    describe("find", function(){
        it("returns unauthorized when the api key is invalid", function(){
            controller.find([11111, 33333], "invalid key", res);

            expect(webError.unauthorized).toHaveBeenCalledWith(res, "Unauthorized");
        });
    });
});