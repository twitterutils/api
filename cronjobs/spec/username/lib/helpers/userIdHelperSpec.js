var rfr = require("rfr");
var userIdHelper = rfr("username/lib/helpers/userIdHelper");

describe("userIdHelper", function(){
    var helper = null;

    beforeEach(function(){
        helper = userIdHelper();
    });

    describe("getUserIdsFromGraph", function () {
        it("returns the graph userId", function(){
            var g = {
                id: '3044090736'
            };

            var ids = helper.getUserIdsFromGraph(g)

            expect(ids).toEqual(['3044090736']);
        });

        it("retrieves the friends", function(){
            var g = {
                id: '3044090736',
                friends: [ 54763413, 13551722 ]
            };

            var ids = helper.getUserIdsFromGraph(g);

            expect(ids).toEqual(['3044090736', '54763413', '13551722']);
        });

        it("retrieves the followers", function(){
            var g = {
                id: '3044090736',
                followers: [ 54763413, 13551722 ]
            };

            var ids = helper.getUserIdsFromGraph(g);

            expect(ids).toEqual(['3044090736', '54763413', '13551722']);
        });

        it("retrieves only the uniq ids", function(){
            var g = {
                id: '3044090736',
                friends: [ 2222, 54763413, 13551722 ],
                followers: [ 54763413, 111111, 13551722, 3044090736 ]
            };

            var ids = helper.getUserIdsFromGraph(g);

            expect(ids).toEqual([
                '3044090736', '2222', '54763413', '13551722', '111111'
            ]);
        });
    });

    describe("getUserIdsFromChanges", function(){
        it ("should read the originators", function(){
            var changes = [
                {originator: "1111111"},
                {originator: "2222222"}
            ];

            var ids = helper.getUserIdsFromChanges(changes);

            expect(ids).toEqual(["1111111", "2222222"]);
        });

        it ("should read the targets", function(){
            var changes = [
                {target: "1111111"},
                {target: "2222222"}
            ];

            var ids = helper.getUserIdsFromChanges(changes);

            expect(ids).toEqual(["1111111", "2222222"]);
        });

        it ("should return only unique ids", function(){
            var changes = [
                {originator: "444444", target: "1111111"},
                {originator: "444444", target: "2222222"},
                {originator: "444444", target: "2222222"}
            ];

            var ids = helper.getUserIdsFromChanges(changes);

            expect(ids).toEqual(["444444", "1111111", "2222222"]);
        });

        it ("doesn't return empty ids", function(){
            var changes = [
                {originator: "", target: "1111111"},
                {originator: "444444", target: ""}
            ];

            var ids = helper.getUserIdsFromChanges(changes);

            expect(ids).toEqual(["444444", "1111111"]);
        });
    });

    describe("getMissingIds", function () {
        it ("returns the ids not stored in the db", function() {
            var ids = helper.getMissingIds(
                ["1111", "3333", "5555", "6666"],
                ["3333", "5555", "0000"]
            );

            expect(ids).toEqual(["1111", "6666"]);
        });

        it ("returns all ids when the db is empty", function() {
            var ids = helper.getMissingIds(
                ["1111", "3333", "5555", "6666"],
                null
            );

            expect(ids).toEqual(["1111", "3333", "5555", "6666"]);
        });
    });

    describe("buildBatches", function() {
        it ("returns batches of the correct size", function(){
            var batches = helper.buildBatches(
                ["1111", "3333", "5555", "6666", "8888"],
                2
            );

            expect(batches).toEqual([
                ["1111", "3333"],
                ["5555", "6666"],
                ["8888"]
            ]);
        });
    });

    describe("extractIds", function(){
        it("returns only the id", function(){
            var dbUsers = [
                {id: "1", name: "pepe"},
                {id: "5", name: "lolo"},
                {id: "6", name: "john"}
            ];

            var ids = helper.extractIds(dbUsers);

            expect(ids).toEqual([
                '1', '5', '6'
            ]);
        });

        it("returns empty when there are no objects", function(){
            var ids = helper.extractIds(null);

            expect(ids).toEqual([]);
        });
    });

    describe("concatIds", function(){
        it("should concatenate the two lists", function(){
            var ids = helper.concatIds(["111111", "3333333"], ["777777", "8888888"]);

            expect(ids).toEqual(["111111", "3333333", "777777", "8888888"]);
        });

        it("concatenating nothing to a list returns the same list", function(){
            var ids = helper.concatIds(["111111", "3333333"], null);

            expect(ids).toEqual(["111111", "3333333"]);
        });

        it("concatenating a list to nothing returns the list", function(){
            var ids = helper.concatIds(null, ["111111", "3333333"]);

            expect(ids).toEqual(["111111", "3333333"]);
        });

        it("should return only unique elements", function(){
            var ids = helper.concatIds(["111111", "3333333", "3333333", "444444"], ["777777", "777777", "8888888", "444444"]);

            expect(ids).toEqual(["111111", "3333333", "444444", "777777", "8888888"]);
        });
    });
});