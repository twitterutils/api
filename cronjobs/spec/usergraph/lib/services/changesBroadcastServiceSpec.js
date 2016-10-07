var rfr = require("rfr");
var promise = require("the-promise-factory");
var changesBroadcastService = rfr("usergraph/lib/services/changesBroadcastService");

describe("changesBroadcastService", function() {
    var service = null;
    var dataService = null;

    beforeEach(function(){
        dataService = {
            save: function(){}
        };
        service = changesBroadcastService(dataService);
        spyOn(console, "log");
    });

    it("saves each change", function(done){
        var broadcastedChanges = [];
        spyOn(dataService, "save").and.callFake((change) => {
            return promise.create((fulfill, reject) => {
                broadcastedChanges = broadcastedChanges.concat(change);
                fulfill();
            });
        });

        service.broadcast(["change1", "change2", "change3"])
            .then(() => {
                expect(broadcastedChanges).toEqual(["change1", "change2", "change3"]);
                done();
            });
    });

    it("fails if a change could not be broadcasted", function(done){
        spyOn(dataService, "save").and.callFake((change) => {
            return promise.create((fulfill, reject) => {
                if (change === "change2") return reject("broadcast error");
                fulfill();
            });
        });

        service.broadcast(["change1", "change2", "change3"])
            .then(null, (err) => {
                expect(err).toEqual("broadcast error");
                done();
            });
    });
});