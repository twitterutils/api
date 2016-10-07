var rfr = require("rfr");
var changesStreamBuilder = rfr("usergraph/lib/services/changesStreamBuilder");

describe("changesStreamBuilder", function (){
    var builder = null;
    var currentGraph = {
        id: 17,
        graphId: 25
    };
    var previousGraph = {
        id: 17,
        graphId: 24
    };

    var seededAddedFriends = [];
    var seededRemovedFriends = [];
    var seededAddedFollowers = [];
    var seededRemovedFollowers = [];

    beforeEach(function(){
        seededAddedFriends = [];
        seededRemovedFriends = [];
        seededAddedFollowers = [];
        seededRemovedFollowers = [];

        var changesAnalyzerStub = {
            determineAddedFriends: (curr, prev) => {
                ensureParamCalls(curr, prev);
                return seededAddedFriends;
            },
            determineRemovedFriends: (curr, prev) => {
                ensureParamCalls(curr, prev);
                return seededRemovedFriends;
            },
            determineAddedFollowers: (curr, prev) => {
                ensureParamCalls(curr, prev);
                return seededAddedFollowers;
            },
            determineRemovedFollowers: (curr, prev) => {
                ensureParamCalls(curr, prev);
                return seededRemovedFollowers;
            },
        };

        function ensureParamCalls(curr, prev){
            if (curr.id !== currentGraph.id ||
                prev.id !== currentGraph.id){
                return jasmine.getEnv().fail("invalid call params");
            }
        }

        builder = changesStreamBuilder(changesAnalyzerStub);
    });

    function getChanges(){
        return builder.getChanges(currentGraph, previousGraph);
    }

    it("returns add friend events", function(done){
        seededAddedFriends = [1111, 2222];

        getChanges().then((changes) => {
            expect(changes).toEqual([
                {type: "friend", originator: 17, target: 1111, prevId: 24, currId: 25},
                {type: "friend", originator: 17, target: 2222, prevId: 24, currId: 25}
            ]);
            done();
        });
    });

    it("returns remove friend events", function(done){
        seededRemovedFriends = [1111, 2222];

        getChanges().then((changes) => {
            expect(changes).toEqual([
                {type: "unfriend", originator: 17, target: 1111, prevId: 24, currId: 25},
                {type: "unfriend", originator: 17, target: 2222, prevId: 24, currId: 25}
            ]);
            done();
        });
    });

    it("returns add follower events", function(done){
        seededAddedFollowers = [1111, 2222];

        getChanges().then((changes) => {
            expect(changes).toEqual([
                {type: "follow", originator: 1111, target: 17, prevId: 24, currId: 25},
                {type: "follow", originator: 2222, target: 17, prevId: 24, currId: 25}
            ]);
            done();
        });
    });

    it("returns remove follower events", function(done){
        seededRemovedFollowers = [1111, 2222];

        getChanges().then((changes) => {
            expect(changes).toEqual([
                {type: "unfollow", originator: 1111, target: 17, prevId: 24, currId: 25},
                {type: "unfollow", originator: 2222, target: 17, prevId: 24, currId: 25}
            ]);
            done();
        });
    });
});