var rfr = require("rfr");
var async = require("async");
var idGenerator = rfr("usergraph/lib/helpers/idGenerator");

describe("idGenerator", function() {
    it("generates unique ids", function(){
        var allIds = {};

        for (var i = 0; i < 10000; i++) {
            var newId = idGenerator();

            if (!allIds[newId]){
                allIds[newId] = 1;
            }
            else{
                jasmine.getEnv().fail("duplicate id found");
            }
        }
    });

    it("generates unique ids even asynchronously", function(done){
        var allIndices = [];
        for (var i = 0; i < 1000; i++) {
            allIndices = allIndices.concat(i);
        }

        var allIds = {};
        async.each(allIndices, (idx, callback) => {
            var newId = idGenerator();
            var err = null;

            if (!allIds[newId]){
                allIds[newId] = 1;
            }
            else{
                err = "duplicate id found";
            }

            callback(err);
        }, (err) => {
            if (err){
                jasmine.getEnv().fail(err);
            }
            else {
                done();
            }
        });
    });
});