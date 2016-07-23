var rfr = require("rfr");
var usernamesDataService = rfr("usernames/lib/dal/usernamesDataService");

describe("usernamesDataService", function(){
    it("requires a database", function(){
        expect(function(){
            usernamesDataService();
        }).toThrow(new Error("A database is required"));
    });
});