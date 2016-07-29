var rfr = require("rfr");
var userFeedDataService = rfr("public/lib/dal/userFeedDataService");


describe("userFeedDataService", function(){
    it("requires a database", function(){
        expect(function(){
            userFeedDataService();
        }).toThrow(new Error("A database is required"));
    });
})