var rfr = require("rfr");
var notificationsTransformer = rfr("feedbuilder/lib/helpers/notificationsTransformer");

describe("notificationsTransformer", function() {
    var transformer = null;

    beforeEach(function(){
        transformer = notificationsTransformer();
    })

    it("returns the source user details", function(){
        var result = transformer.transform([
            {userId: "11111", userName: "pepe"}
        ],[
            {id: "id0", type: "type1", userId: "11111", details: null, creation_time_str: "date1"},
            {id: "id2", type: "type1", userId: "11111", details: null, creation_time_str: "date2"}
        ]);

        expect(result).toEqual([
            {id: "id0", type: "type1", userId: "11111", userName: "pepe", url:"https://twitter.com/@pepe", details: null, creation_time_str: "date1"},
            {id: "id2", type: "type1", userId: "11111", userName: "pepe", url:"https://twitter.com/@pepe", details: null, creation_time_str: "date2"}
        ]);
    })

    it("updates the target details for unfollow notifications", function(){
        var result = transformer.transform([
            {userId: "11111", userName: "pepe"},
            {userId: "22222", userName: "mtnez"}
        ],[
            {id: "id0", type: "type1", userId: "11111", details: null, creation_time_str: "date1"},
            {id: "id2", type: "unfollow", userId: "11111", details: { target: "22222" }, creation_time_str: "date2"}
        ]);

        expect(result).toEqual([
            {id: "id0", type: "type1", userId: "11111", userName: "pepe", url:"https://twitter.com/@pepe", details: null, creation_time_str: "date1"},
            {id: "id2", type: "unfollow", userId: "11111", userName: "pepe", url:"https://twitter.com/@pepe", details: {
                target: "22222",
                userName: "mtnez",
                url: "https://twitter.com/@mtnez"
            }, creation_time_str: "date2"}
        ]);
    })
});