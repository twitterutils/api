var promise = require("the-promise-factory");
var rfr = require("rfr");
var autounfollow = rfr("autounfollow/lib/services/autounfollow");

describe("autounfollow", function () {
    var dbConnectionFactoryStub = null;
    var dbCreationCount = null;
    var seededDb = null;
    var seededDbError = null;

    var registeredUsersDataServiceStub = null;
    var seededRegisteredUsers = null;
    var seededRegisteredUsersError = null;

    var processedUsers = null;
    var seededSingleUserProcessorError = null;

    var service = null;

    beforeEach(function(){
        dbCreationCount = 0;
        seededDb = null;
        seededDbError = null;
        dbConnectionFactoryStub = function(connectionString){
            if (connectionString !== "TWU_CRON_AUTOUNFOLLOW_DB_CONNECTION_STRING"){
                throw new Error("invalid Invocation");
            }

            return promise.create((fulfill, reject) => {
                dbCreationCount++;

                if (seededDb) return fulfill(seededDb);
                if (seededDbError) return reject(seededDbError);

                throw new Error("Invalid DbFactory Invocation");
            });
        };

        seededRegisteredUsers = null;
        seededRegisteredUsersError = null;
        registeredUsersDataServiceStub = {
            all: function(){
                return promise.create((fulfill, reject) => {
                    if (seededRegisteredUsers) return fulfill(seededRegisteredUsers);
                    if (seededRegisteredUsersError) return reject(seededRegisteredUsersError);

                    throw new Error("Invalid RegisteredUsers Invocation");
                });
            }
        };
        spyOn(registeredUsersDataServiceStub, "all").and.callThrough();

        processedUsers = [];
        seededSingleUserProcessorError = null;
        var singleUserProcessorFactory = {
            create: (db) => {
                if (db !== seededDb) throw new Error("Invalid SingleUserProcessorFactory Invocation");

                return {
                    process: (user) => {
                        return promise.create((fulfill, reject) => {
                            processedUsers.push(user);

                            if (seededSingleUserProcessorError) return reject(seededSingleUserProcessorError);

                            fulfill();
                        });
                    }
                };
            }
        }

        service = autounfollow(dbConnectionFactoryStub, registeredUsersDataServiceStub, singleUserProcessorFactory);
    });

    it("opens a db connection", function(done){
        seededDb = {id: "the db"};
        seededRegisteredUsers = ["user 1", "user 2"];

        service.run()
            .then(() => {
                expect(dbCreationCount).toBe(1);
                done();
            });
    });

    it("fails on db connection error", function(done){
        seededDbError = "could not connect to db";

        service.run()
            .then(null, (err) => {
                expect(err).toBe("could not connect to db");
                done();
            });
    });

    it("reads the registered users", function(done){
        seededDb = {id: "the db"};
        seededRegisteredUsers = ["user 1", "user 2"];

         service.run()
            .then(() => {
                expect(registeredUsersDataServiceStub.all).toHaveBeenCalled();
                done();
            });
    });

    it("fails on registered users error", function(done){
        seededDb = {id: "the db"};
        seededRegisteredUsersError = "could not read registered users";

        service.run()
            .then(null, (err) => {
                expect(err).toBe("could not read registered users");
                done();
            });
    });

    it("processes each registered user", function(done){
        seededDb = {id: "the db"};
        seededRegisteredUsers = ["user 1", "user 2"];

         service.run()
            .then(() => {
                expect(processedUsers).toEqual(["user 1", "user 2"]);
                done();
            });
    });

    it("fails on processing error", function(done){
        seededDb = {id: "the db"};
        seededRegisteredUsers = ["user 1", "user 2"];
        seededSingleUserProcessorError = "could not process user";

         service.run()
            .then(null, (err) => {
                expect(err).toBe("could not process user");
                done();
            });
    });
});