var rfr = require("rfr");
var changesAnalyzer = rfr("usergraph/lib/services/changesAnalyzer");

describe("changesAnalyzer", function(){
    var analyzer = null;

    beforeEach(function(){
        analyzer = changesAnalyzer();
    });

    describe("determineAddedFriends", function(){
        it ("returns empty when the previous graph was empty", function(){
            var addedFriends = analyzer.determineAddedFriends(
                {friends: [1111, 2222, 3333]},
                null
            );

            expect(addedFriends).toEqual([]);
        });

        it ("returns empty when friends did not change", function(){
            var addedFriends = analyzer.determineAddedFriends(
                {friends: [1111, 2222, 3333]},
                {friends: [2222, 1111, 3333]}
            );

            expect(addedFriends).toEqual([]);
        });

        it("returns the new friends", function(){
            var addedFriends = analyzer.determineAddedFriends(
                {friends: [1111, 2222, 3333]},
                {friends: [1111, 4444]}
            );

            expect(addedFriends).toEqual([2222, 3333]);
        });
    });

    describe("determineRemovedFriends", function(){
        it ("returns empty when the previous graph was empty", function(){
            var removedFriends = analyzer.determineRemovedFriends(
                {friends: [1111, 2222, 3333]},
                null
            );

            expect(removedFriends).toEqual([]);
        });

        it ("returns empty when friends did not change", function(){
            var removedFriends = analyzer.determineRemovedFriends(
                {friends: [1111, 2222, 3333]},
                {friends: [2222, 1111, 3333]}
            );

            expect(removedFriends).toEqual([]);
        });

        it("returns the removed friends", function(){
            var removedFriends = analyzer.determineRemovedFriends(
                {friends: [1111, 2222, 3333]},
                {friends: [1111, 4444, 555]}
            );

            expect(removedFriends).toEqual([4444, 555]);
        });
    });

    describe("determineAddedFollowers", function(){
        it ("returns empty when the previous graph was empty", function(){
            var addedFollowers = analyzer.determineAddedFollowers(
                {followers: [1111, 2222, 3333]},
                null
            );

            expect(addedFollowers).toEqual([]);
        });

        it ("returns empty when followers did not change", function(){
            var addedFollowers = analyzer.determineAddedFollowers(
                {followers: [1111, 2222, 3333]},
                {followers: [2222, 1111, 3333]}
            );

            expect(addedFollowers).toEqual([]);
        });

        it("returns the new followers", function(){
            var addedFollowers = analyzer.determineAddedFollowers(
                {followers: [1111, 2222, 3333]},
                {followers: [1111, 4444]}
            );

            expect(addedFollowers).toEqual([2222, 3333]);
        });
    });

    describe("determineRemovedFollowers", function(){
        it ("returns empty when the previous graph was empty", function(){
            var removedFollowers = analyzer.determineRemovedFollowers(
                {followers: [1111, 2222, 3333]},
                null
            );

            expect(removedFollowers).toEqual([]);
        });

        it ("returns empty when followers did not change", function(){
            var removedFollowers = analyzer.determineRemovedFollowers(
                {followers: [1111, 2222, 3333]},
                {followers: [2222, 1111, 3333]}
            );

            expect(removedFollowers).toEqual([]);
        });

        it("returns the removed followers", function(){
            var removedFollowers = analyzer.determineRemovedFollowers(
                {followers: [1111, 2222, 3333]},
                {followers: [1111, 4444, 555]}
            );

            expect(removedFollowers).toEqual([4444, 555]);
        });
    });    
});