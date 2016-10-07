var rfr = require("rfr");
var feedBuilderService = rfr("feedbuilder/lib/services/feedbuilder");

describe("feedBuilder", function () {
    var service = null;

    var registeredUsersRead = false;
    var registeredUsersAllSeededError = null;
    var registeredUsersAllSeededResult = null;

    var db = {name: "seeded db"};
    var dbConnectionString = null;
    var dbConnectionSeededError = null;

    var saveReadUsers = null;
    var saveSeededError = null;

    beforeEach(function(){
        registeredUsersRead = false;
        registeredUsersAllSeededError = null;
        registeredUsersAllSeededResult = [];
        var registeredUsersDataServiceStub = {
            all: function(){
                registeredUsersRead = true;
                return {
                    then: (fulfill, reject) => {
                        if (registeredUsersAllSeededError){
                            reject(registeredUsersAllSeededError);
                            return;
                        }

                        fulfill(registeredUsersAllSeededResult);
                    }
                }
            }
        };

        dbConnectionString = null;
        dbConnectionSeededError = null;
        var dbConnectionFactoryStub = (connString) => {
            dbConnectionString = connString;
            return {
                then: (fulfill, reject) => {
                    if (dbConnectionSeededError){
                        reject(dbConnectionSeededError);
                        return;
                    }

                    fulfill(db);
                }
            }
        }

        saveReadUsers = [];
        saveSeededError = null;
        var userFeedServiceStub = {
            save: (user) => {
                saveReadUsers.push(user);

                return {
                    then: (fulfill, reject) => {
                        if (saveSeededError){
                            reject(saveSeededError);
                            return;
                        }

                        fulfill();
                    }
                }
            }
        }

        var userFeedServiceFactory = {
            create: (pDb) => {
                if (pDb !== db){
                    jasmine.getEnv().fail("invalid invocation");
                    return;
                }

                return userFeedServiceStub;
            }
        }

        service = feedBuilderService(
            registeredUsersDataServiceStub,
            dbConnectionFactoryStub,
            userFeedServiceFactory
        );

        spyOn(console, "log");
    });

    it ("reads the registered users", function(done){
        service.build().then(() => {
            expect(registeredUsersRead).toBe(true);
            done();
        });
    });

    it ("fails when users could not be read", function(done){
        registeredUsersAllSeededError = "error reading users";

        service.build().then(null, (err) => {
            expect(err).toBe("error reading users");
            done();
        });
    });

    it ("connects to the correct database", function(done){
        service.build().then(() => {
            expect(dbConnectionString).toBe("TWU_CRON_FEEDBUILDER_DB_CONNECTION_STRING");
            done();
        });
    });

    it ("fails when db connection fails", function(done){
        dbConnectionSeededError = "db connection error";

        service.build().then(null, (err) => {
            expect(err).toBe("db connection error");
            done();
        });
    });

    it ("saves each registered user", function(done){
        registeredUsersAllSeededResult = [
            {id: "1111", userName: "pepe"},
            {id: "2222", userName: "mtnez"}
        ];

        service.build().then(() => {
            expect(saveReadUsers).toEqual([
                {id: "1111", userName: "pepe"},
                {id: "2222", userName: "mtnez"}
            ]);
            done();
        });
    });

    it ("fails when at least a user could not be saved", function(done){
        registeredUsersAllSeededResult = [
            {id: "1111", userName: "pepe"}
        ];
        saveSeededError = "error saving";

        service.build().then(null, (err) => {
            expect(err).toBe("error saving");
            done();
        });
    });
});