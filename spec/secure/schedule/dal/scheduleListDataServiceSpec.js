var rfr = require("rfr");
var promise = require("the-promise-factory");
var scheduleListDataService = rfr("secure/schedule/lib/dal/scheduleListDataService");

describe("scheduleListDataService", function () {
    it("requires a database", function(){
        expect(function(){
            scheduleListDataService();
        }).toThrow(new Error("A database is required"));
    });

    var dataService = null;
    var collectionStub = null;

    beforeEach(function(){
        collectionStub = {
            find: function(){}
        };

        var db = {
            collection: function(collectionName){
                if (collectionName === "schedule_upcoming_list"){
                    return collectionStub;
                }
            }
        };

        dataService = scheduleListDataService(db);
    });
})
