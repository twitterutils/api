var rfr = require("rfr");
var promise = require("the-promise-factory");
var userScheduleDataService = rfr("secure/schedule/lib/dal/userScheduleDataService");

describe("userScheduleDataService", function() {
    it("requires a database", function(){
        expect(function(){
            userScheduleDataService();
        }).toThrow(new Error("A database is required"));
    });
})
