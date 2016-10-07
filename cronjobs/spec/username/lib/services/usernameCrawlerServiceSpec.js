var rfr = require("rfr");
var usernameCrawlerService = rfr("username/lib/services/usernameCrawlerService");

describe("usernameCrawlerService", function() {
    var service = null;

    var db = {name: "my db"};
    var usedConnectionString = null;
    var seededDbConnectionError = null;

    var savedUsernames = null;
    var seededSaveUsernameError = null;

    var seededReadUsernamesError = null;
    var seededUsernames = null;

    beforeEach(function(){
        usedConnectionString = null;
        seededDbConnectionError = null;
        var dbConnectionFactoryStub = function(connString){
            usedConnectionString = connString;

            return {
                then:(fulfill, reject) => {
                    if (seededDbConnectionError){
                        reject(seededDbConnectionError);
                        return;
                    }

                    fulfill(db);
                }
            }
        };

        savedUsernames = [];
        seededSaveUsernameError = null;
        var usernameDataServiceStub = function(pDb){
            if (pDb !== db){
                return jasmine.getEnv().fail("Invalid seeding");
            }

            return {
                save: function(user){
                    savedUsernames.push(user);

                    return {
                        then:(fulfill, reject) => {
                            if (seededSaveUsernameError){
                                reject(seededSaveUsernameError);
                                return;
                            }

                            fulfill();
                        }
                    }
                }
            }
        };

        seededReadUsernamesError = null;
        seededUsernames = [];
        var usernamesReaderStub = {
            read: function(){
                return {
                    then: (fulfill, reject) => {
                        if (seededReadUsernamesError){
                            reject(seededReadUsernamesError);
                            return;
                        }

                        fulfill(seededUsernames);
                    }
                }
            }
        };

        service = usernameCrawlerService(
            dbConnectionFactoryStub,
            usernameDataServiceStub,
            usernamesReaderStub
        );
    });

    it ("opens a db connection", function(done){
        service.run().then(() => {
            expect(usedConnectionString).toBe("TWU_CRON_USERNAME_DB_CONNECTION_STRING");
            done();
        });
    });

    it ("fails when db could not be connected", function(done){
        seededDbConnectionError = "db error";

        service.run().then(null, (err) => {
            expect(err).toBe("db error");
            done();
        });
    });

    it ("fails when usernames could not be read", function(done){
        seededReadUsernamesError = "error reading usernames";

        service.run().then(null, (err) => {
            expect(err).toBe("error reading usernames");
            done();
        });
    });

    it ("saves each username", function(done){
        seededUsernames = ["user1", "user2", "user3"];

        service.run().then(() => {
            expect(savedUsernames).toEqual([
                "user1", "user2", "user3"
            ]);
            done();
        });
    });

    it ("fails when at least a username could not be saved", function(done){
        seededUsernames = ["user1", "user2", "user3"];
        seededSaveUsernameError = "error saving";

        service.run().then(null, (err) => {
            expect(err).toBe("error saving");
            done();
        });
    });
});
