var rfr = require("rfr");
var promise = require("the-promise-factory");
var usernameReader = rfr("username/lib/services/usernameReader");

describe("usernameReader", function(){
    var service = null;

    var seededBatchesResult = null;
    var seededBatchesError = null;
    var userIdBatchBuilderStub = null;

    var twitterDataServiceStub = null;
    var readBatches = null;
    var seededGetUsersError = null;
    var getUsersCalculatorStub = null;

    beforeEach(function(){
        seededBatchesResult = [];
        seededBatchesError = null;
        userIdBatchBuilderStub = {
            build: () => {
                return promise.create((fulfill, reject) => {
                    if (seededBatchesError){
                        reject(seededBatchesError);
                        return;
                    }

                    fulfill(seededBatchesResult);
                });
            }
        };

        readBatches = [];
        seededGetUsersError = null;

        getUsersCalculatorStub = (batch) => {
            return [];
        }

        twitterDataServiceStub = {
            getUsers: (batch) => {
                readBatches.push(batch);

                return promise.create((fulfill, reject) => {
                    if (seededGetUsersError){
                        reject(seededGetUsersError);
                        return;
                    }

                    fulfill(getUsersCalculatorStub(batch));
                });
            }
        }

        service = usernameReader(userIdBatchBuilderStub, twitterDataServiceStub);

        spyOn(console, "log");
    });

    it ("reads the username batches", function(done){
        spyOn(userIdBatchBuilderStub, "build").and.callThrough();

        service.read().then(() => {
            expect(userIdBatchBuilderStub.build).toHaveBeenCalled();
            done();
        });
    });

    it ("fails when batches could not be read", function(done){
        seededBatchesError = "oh crap";

        service.read().then(null, (err) => {
            expect(err).toBe("oh crap");
            done();
        });
    });

    it ("reads the usernames for each batch", function(done){
        seededBatchesResult = ["b1", "b2", "b3"];

        service.read().then(() => {
            expect(readBatches).toEqual(["b1", "b2", "b3"]);
            done();
        });
    });

    it ("fails if usernames could not be read", function(done){
        seededBatchesResult = ["b1", "b2", "b3"];
        seededGetUsersError = "error reading users";

        service.read().then(null, (err) => {
            expect(err).toBe("error reading users");
            done();
        });
    });

    it ("merges all the usernames", function(done){
        seededBatchesResult = ["b1", "b2", "b3"];
        getUsersCalculatorStub = (batch) => {
            return [
                batch + "-1111",
                batch + "-2222",
                batch + "-3333"
            ];
        }

        service.read().then((result) => {
            expect(result).toEqual([
                "b1-1111",
                "b1-2222",
                "b1-3333",

                "b2-1111",
                "b2-2222",
                "b2-3333",

                "b3-1111",
                "b3-2222",
                "b3-3333"
            ]);
            done();
        });
    });
});