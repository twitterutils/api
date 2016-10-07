var rfr = require("rfr");
var userIdBatchBuilder = rfr("username/lib/services/userIdBatchBuilder");

describe("userIdBatchBuilder", function() {
    var builder = null;

    var db = {name: "my db"};
    var usedConnectionString = null;
    var seededDbConnectionError = null;

    var readUsernamesInvocations = 0;
    var seededReadUsernameError = null;
    var seededDbUsernames = null;

    var registeredUsersInvocationCount = 0;
    var seededRegisteredUsersError = null;
    var seededRegisteredUsers = null;

    var userIdsReaderUsersRead = null;
    var userIdsReaderUsersSeededIds = [];
    var userIdsReaderUsersSeededError = null;

    var userIdHelperStub = null;

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

        readUsernamesInvocations = 0;
        seededReadUsernameError = null;
        seededDbUsernames = [];
        var usernameDataService = function(pDb){
            if (pDb !== db){
                return jasmine.getEnv().fail("Invalid seeding");
            }

            return {
                all: function(){
                    readUsernamesInvocations++;

                    return {
                        then:(fulfill, reject) => {
                            if (seededReadUsernameError){
                                reject(seededReadUsernameError);
                                return;
                            }

                            fulfill(seededDbUsernames);
                        }
                    }
                }
            }
        };

        registeredUsersInvocationCount = 0;
        seededRegisteredUsersError = null;
        seededRegisteredUsers = [];
        var registeredUsersDataServiceStub = {
            all: function(){
                registeredUsersInvocationCount++;

                return {
                    then: (fulfill, reject) => {
                        if (seededRegisteredUsersError){
                            reject(seededRegisteredUsersError);
                            return;
                        }

                        fulfill(seededRegisteredUsers);
                    }
                }
            }
        };

        userIdsReaderUsersRead = null;
        userIdsReaderUsersSeededIds = [];
        userIdsReaderUsersSeededError = null;
        var userIdsReaderStub = {
            getAllIdsFor: function(users){
                userIdsReaderUsersRead = users;

                return {
                    then: (fulfill, reject) => {
                        if (userIdsReaderUsersSeededError){
                            reject(userIdsReaderUsersSeededError);
                            return;
                        }

                        fulfill(userIdsReaderUsersSeededIds);
                    }
                }
            }
        };

        userIdHelperStub = rfr("username/lib/helpers/userIdHelper")();

        builder = userIdBatchBuilder(
            dbConnectionFactoryStub,
            usernameDataService,
            registeredUsersDataServiceStub,
            userIdsReaderStub,
            userIdHelperStub
        );

        spyOn(console, "log");
    });

    it ("opens a db connection", function(done){
        builder.build().then(() => {
            expect(usedConnectionString).toBe("TWU_CRON_USERNAME_DB_CONNECTION_STRING");
            done();
        });
    });

    it ("fails when db could not be connected", function(done){
        seededDbConnectionError = "db error";

        builder.build().then(null, (err) => {
            expect(err).toBe("db error");
            done();
        });
    });

    it ("reads all the usernames from the db", function(done){
        builder.build().then(() => {
            expect(readUsernamesInvocations).toBe(1);
            done();
        });
    });

    it ("fails when usernames could not be read", function(done){
        seededReadUsernameError = "usernames error";

        builder.build().then(null, (err) => {
            expect(err).toBe("usernames error");
            done();
        });
    });

    it ("extracts the ids from the db users", function(done){
        spyOn(userIdHelperStub, "extractIds").and.callThrough();
        seededDbUsernames = [
            {id: "1"}, {id: "2"}, {id: "3"}
        ];

        builder.build().then(() => {
            expect(userIdHelperStub.extractIds).toHaveBeenCalledWith(seededDbUsernames);
            done();
        });
    });

    it ("reads all the registered users", function(done){
        builder.build().then(() => {
            expect(registeredUsersInvocationCount).toBe(1);
            done();
        });
    });

    it ("fails when registered users could not be read", function(done){
        seededRegisteredUsersError = "registered users error";

        builder.build().then(null, (err) => {
            expect(err).toBe("registered users error");
            done();
        });
    });

    it ("reads the ids for the registered users", function(done){
        seededRegisteredUsers = [
            {id: 1}, {id: 2}, {id: 3}
        ];

        builder.build().then(() => {
            expect(userIdsReaderUsersRead).toBe(seededRegisteredUsers);
            done();
        });
    });

    it ("fails when ids could not be read from registered users", function(done){
        userIdsReaderUsersSeededError = "error extracting ids";

        builder.build().then(null, (err) => {
            expect(err).toBe("error extracting ids");
            done();
        });
    });

    it ("finds all the missing ids", function(done){
        userIdsReaderUsersSeededIds = [1, 2, 3, 4, 5];
        seededDbUsernames = [{id: 1}, {id: 2}];
        spyOn(userIdHelperStub, "getMissingIds").and.callThrough();

        builder.build().then(() => {
            expect(userIdHelperStub.getMissingIds).toHaveBeenCalledWith(
                [1, 2, 3, 4, 5], [1, 2]
            );
            done();
        });
    });

    it ("builds batches of 100", function(done){
        userIdsReaderUsersSeededIds = [1, 2, 3, 4, 5];
        seededDbUsernames = [{id: 1}, {id: 2}];
        spyOn(userIdHelperStub, "buildBatches").and.callThrough();

        builder.build().then(() => {
            expect(userIdHelperStub.buildBatches).toHaveBeenCalledWith(
                [3, 4, 5], 100
            );
            done();
        });
    });

    it ("returns the build batches", function(done){
        spyOn(userIdHelperStub, "buildBatches").and.returnValue([
            [1, 2, 4], [6, 9]
        ]);

        builder.build().then((result) => {
            expect(result).toEqual([
                [1, 2, 4], [6, 9]
            ]);
            done();
        });
    });
})