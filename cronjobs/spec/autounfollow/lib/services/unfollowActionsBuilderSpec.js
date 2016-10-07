var rfr = require("rfr");
var unfollowActionsBuilder = rfr("autounfollow/lib/services/unfollowActionsBuilder");

describe("unfollowActionsBuilder", function () {
    var builder = null;

    beforeEach(function(){
        builder = unfollowActionsBuilder();
    });

    it("builds one action per unfollow change", function(done){
        builder.build([
            {"type":"follow","originator":1001,"target":"2001"},
            {"type":"unfollow","originator":1001,"target":"2001"},
            {"type":"unfollow","originator":"1002","target":"2001"},
        ], {
            id:"2001",
            friends:[1001, 1002, 1003],
            followers:[]
        }).then((actions) => {
            expect(actions).toEqual([1001, "1002"]);
            done();
        });
    });

    it("only considers those users that I'm currently following", function(done){
        builder.build([
            {"type":"unfollow","originator":1001,"target":"2001"},
            {"type":"unfollow","originator":"1002","target":"2001"},
        ], {
            id:"2001",
            friends:[1003, 1001, "1004", "1005"],
            followers:[]
        }).then((actions) => {
            expect(actions).toEqual([1001]);
            done();
        });
    });
});