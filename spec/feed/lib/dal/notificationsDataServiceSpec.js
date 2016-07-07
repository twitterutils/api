var rfr = require("rfr");
var notificationsDataService = rfr("feed/lib/dal/notificationsDataService");

describe("notificationsDataService", function () {
    it("requires a database", function(){
        expect(function(){
            notificationsDataService();
        }).toThrow(new Error("A database is required"));
    });
});