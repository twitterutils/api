var rfr = require("rfr");
var promise = require("the-promise-factory");
var twitterGraphBuilder = rfr("usergraph/lib/services/twitterGraphBuilder");

describe("twitterGraphBuilder", function(){
    var builder = null;
    var twitterDataServiceStub = null;

    beforeEach(function(){
        twitterDataServiceStub = {
            getFollowers: function(){},
            getFriends: function(){}
        };

        function idGenerator(){
            return "unique Id";
        }

        builder = twitterGraphBuilder(twitterDataServiceStub, idGenerator);
    });

    function setupSomeFriends(){
        spyOn(twitterDataServiceStub, "getFriends").and.callFake((userName) => {
            if (userName === "lolo"){
                return promise.create((fulfill, reject) => {
                    fulfill([777, 888, 999]);
                });
            }
        });
    }

    function setupSomeFollowers(){
        spyOn(twitterDataServiceStub, "getFollowers").and.callFake((userName) => {
            if (userName === "lolo"){
                return promise.create((fulfill, reject) => {
                    fulfill([4444, 5555, 6666]);
                });
            }
        });
    }

    it("result contains request fields", function(done){
        setupSomeFollowers();
        setupSomeFriends();

        builder.buildGraphFor({id: '11111', userName: 'lolo'})
            .then((userInfo) => {
                expect(userInfo.id).toBe("11111");
                expect(userInfo.userName).toBe("lolo");
                done();
            });
    });

    it("result contains a unique graph id", function(done){
        setupSomeFollowers();
        setupSomeFriends();

        builder.buildGraphFor({id: '11111', userName: 'lolo'})
            .then((userInfo) => {
                expect(userInfo.graphId).toBe("unique Id");
                done();
            });
    });

    it("reads twitter followers", function(done){
        setupSomeFollowers();
        setupSomeFriends();

        builder.buildGraphFor({id: '11111', userName: 'lolo'})
            .then((userInfo) => {
                expect(userInfo.followers).toEqual([4444, 5555, 6666]);
                done();
            });
    });

    it("fails on followers read error", function(done){
        setupSomeFriends();
        spyOn(twitterDataServiceStub, "getFollowers").and.callFake((userName) => {
            return promise.create((fulfill, reject) => {
                reject("something went wrong");
            });
        });

        builder.buildGraphFor({id: '11111', userName: 'lolo'})
            .then(null, (error) => {
                expect(error).toBe("something went wrong");
                done();
            });
    });

    it("reads twitter friends", function(done){
        setupSomeFollowers();
        setupSomeFriends();

        builder.buildGraphFor({id: '11111', userName: 'lolo'})
            .then((userInfo) => {
                expect(userInfo.friends).toEqual([777, 888, 999]);
                done();
            });
    });

    it("fails on friends read error", function(done){
        setupSomeFollowers();
        spyOn(twitterDataServiceStub, "getFriends").and.callFake((userName) => {
            return promise.create((fulfill, reject) => {
                reject("something went wrong");
            });
        });

        builder.buildGraphFor({id: '11111', userName: 'lolo'})
            .then(null, (error) => {
                expect(error).toBe("something went wrong");
                done();
            });
    });
});