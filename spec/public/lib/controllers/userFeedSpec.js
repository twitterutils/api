var rfr = require("rfr");
var userFeedController = rfr("public/lib/controllers/userFeed");

describe("userFeed", function () {
    var res = {
        name: "my web response",
        send: () => {}
    };
    var controller = null;

    var db = {name: "my db"};
    var readDbConnectionString = null;
    var seededDbError = null;

    beforeEach(function(){
        spyOn(res, "send");

        seededDbError = null;
        readDbConnectionString = null;
        var dbConnectionFactoryStub = (r, connString) => {
            if (r !== res){
                return jasmine.getEnv().fail("invalid invocation");
            }

            readDbConnectionString = connString;

            return {
                then: (fulfill, reject) => {
                    if (seededDbError){
                        reject(seededDbError);
                        return;
                    }

                    fulfill(db);
                }
            }
        }

        controller = userFeedController(dbConnectionFactoryStub);
    })

    it ("opens a db connection", function(){
        controller.read("lolo", res);

        expect(readDbConnectionString).toBe("FEEDBUILDER_DB_CONNECTION_STRING");
    });
})