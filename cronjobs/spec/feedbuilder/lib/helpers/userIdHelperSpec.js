var rfr = require("rfr");
var userIdHelper = rfr("feedbuilder/lib/helpers/userIdHelper");

describe("userIdHelper", function() {
    var helper = null;

    beforeEach(function(){
        helper = userIdHelper();
    })

    describe("extractIds", function(){
        it ("extracts the ids", function(){
            var ids = helper.extractIds([
                {id: "id1", type: "any", userId: "11111", details: {}},
                {id: "id2", type: "any", userId: "22222", details: {}},
                {id: "id3", type: "any", userId: "33333", details: {}}
            ]);

            expect(ids).toEqual(["11111", "22222", "33333"]);
        });

        it ("returns the target from unfollow notifications", function(){
            var ids = helper.extractIds([
                {id: "id1", type: "unfollow", userId: "11111", details: {
                    target: "444441"
                }},
                {id: "id2", type: "any", userId: "22222", details: {}},
                {id: "id3", type: "unfollow", userId: "33333", details: {
                    target: "444440"
                }}
            ]);

            expect(ids).toEqual(["11111", "22222", "33333", "444441", "444440"]);
        });

        it ("returns only unique values", function(){
            var ids = helper.extractIds([
                {id: "id1", type: "unfollow", userId: "11111", details: {
                    target: "44444"
                }},
                {id: "id2", type: "any", userId: "22222", details: {}},
                {id: "id2", type: "feed", userId: "22222", details: {}},
                {id: "id3", type: "unfollow", userId: "33333", details: {
                    target: "44444"
                }}
            ]);

            expect(ids).toEqual(["11111", "22222", "33333", "44444"]);
        });
    });

    describe("toDictionary", function(){
        it ("creates a dictionary for each username", function(){
            var result = helper.toDictionary([
                { userId: "111111", userName: "pepe" },
                { userId: "222222", userName: "lolo" },
                { userId: "333333", userName: "jose" }
            ]);

            expect(Object.keys(result).length).toBe(3);
            expect(result["111111"]).toEqual({ userId: "111111", userName: "pepe" });
            expect(result["222222"]).toEqual({ userId: "222222", userName: "lolo" });
            expect(result["333333"]).toEqual({ userId: "333333", userName: "jose" });
        });
    });
});