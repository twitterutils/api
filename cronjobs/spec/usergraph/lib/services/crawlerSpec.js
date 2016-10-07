var rfr = require("rfr");
var promise = require("the-promise-factory");
var crawler = rfr("usergraph/lib/services/crawler");

describe("crawler", function(){
    var service = null
    var registeredUsersDataService = null;

    var userScheduleDataService = null;
    var seededUserScheduleResult = null;
    var seededUserScheduleError = null;

    var createdUserChangesServiceCount = 0;
    var seededCreationError = null;
    var seededChangesCreationError = null;
    var userChangesService = null;
    var changesBroadcastService = null;

    beforeEach(function (){
        registeredUsersDataService = {
            all: function(){}
        };
        userChangesService = {
            changesFor: function(){}
        };

        createdUserChangesServiceCount = 0;
        seededCreationError = null;
        var userChangesServiceFactory = {
            create: function(){
                createdUserChangesServiceCount++;

                return promise.create((fulfill, reject) => {
                    if (seededCreationError) return reject(seededCreationError);

                    fulfill(userChangesService);
                });
            }
        };

        changesBroadcastService = {
            broadcast: function(){}
        }
        seededChangesCreationError = null;
        var changesBroadcastServiceFactory = {
            create: function(){
                return promise.create((fulfill, reject) => {
                    if (seededChangesCreationError) return reject(seededChangesCreationError);

                    fulfill(changesBroadcastService);
                });
            }
        }

        seededUserScheduleResult = [];
        seededUserScheduleError = null;
        userScheduleDataService = {
            read: () => {
                return promise.create((fulfill, reject) => {
                    if (seededUserScheduleError){
                        reject(seededUserScheduleError);
                        return;
                    }

                    fulfill(seededUserScheduleResult);
                })
            }
        }

        service = crawler(
            userChangesServiceFactory,
            registeredUsersDataService,
            userScheduleDataService,
            changesBroadcastServiceFactory
        );

        spyOn(console, "log");
    });

    function setupSomeUsers(userIds){
        var users = (userIds || []).map((id) => {
            return {
                id: id
            }
        })

        spyOn(registeredUsersDataService, "all").and.callFake(function(){
            return promise.create((fulfill, reject) => {
                fulfill(users);
            })
        });
    }

    function setupBroadcast(seededError){
        spyOn(changesBroadcastService, "broadcast").and.callFake(function(changes){
            return promise.create((fulfill, reject) => {
                if (seededError) return reject(seededError);

                fulfill();
            });
        });
    }

    it("retrieves the registered users", function(done){
        spyOn(registeredUsersDataService, "all");

        service.run().then(null, () => {
            expect(registeredUsersDataService.all).toHaveBeenCalled();
            done()
        });
    });

    it("fails when users could not be retrieved", function(done){
        spyOn(registeredUsersDataService, "all").and.callFake(function(){
            return promise.create((fulfill, reject) => {
                reject("error reading users");
            })
        });

        service.run()
            .then(null, (error) => {
                expect(error).toBe("error reading users");
                done();
            });
    });

    it("reads the user schedule", function(done){
        setupSomeUsers(null);
        spyOn(userScheduleDataService, "read").and.callThrough();

        service.run().then(() => {
            expect(userScheduleDataService.read).toHaveBeenCalled();
            done();
        });
    });

    it("fails when the schedule could not be read", function(done){
        setupSomeUsers(null);
        seededUserScheduleError = "error reading schedule";

        service.run()
            .then(null, (error) => {
                expect(error).toBe("error reading schedule");
                done();
            });
    });

    it("creates the userChangesService", function(done){
        setupSomeUsers(null);
        setupBroadcast();

        service.run()
            .then(() => {
                expect(createdUserChangesServiceCount).toBe(1);
                done();
            });
    });

    it("fails when the userChangesService creation fails", function(done){
        seededCreationError = "creation error";
        setupSomeUsers(null);

        service.run()
            .then(null, (error) => {
                expect(error).toBe("creation error");
                done();
            });
    });

    it("fails when the changesBroadcastService creation fails", function(done){
        seededChangesCreationError = "broadcast creation error";
        setupSomeUsers(null);

        service.run()
            .then(null, (error) => {
                expect(error).toBe("broadcast creation error");
                done();
            });
    });

    it("retrieves the changes for each user", function(done){
        setupSomeUsers([1111, 2222, 44444]);
        seededUserScheduleResult = [1111, 2222, 44444];
        var retrievedUsers = [];
        spyOn(userChangesService, "changesFor").and.callFake((user) => {
            retrievedUsers.push(user);
            return promise.create((fulfill, reject) => {
                fulfill(null);
            });
        });
        setupBroadcast();

        service.run()
            .then(() => {
                expect(retrievedUsers).toEqual([
                    {id: 1111},
                    {id: 2222},
                    {id: 44444}
                ]);
                done();
            });
    });

    it("retrieves the changes for each user in the schedule", function(done){
        setupSomeUsers([1111, 2222, 44444, 55555]);
        seededUserScheduleResult = [2222, 44444];
        var retrievedUsers = [];
        spyOn(userChangesService, "changesFor").and.callFake((user) => {
            retrievedUsers.push(user);
            return promise.create((fulfill, reject) => {
                fulfill(null);
            });
        });
        setupBroadcast();

        service.run()
            .then(() => {
                expect(retrievedUsers).toEqual([
                    {id: 2222},
                    {id: 44444}
                ]);
                done();
            });
    });

    it("fails if at least one user changes failed to be read", function(done){
        setupSomeUsers([1111, 2222, 44444]);
        seededUserScheduleResult = [1111, 2222, 44444];
        spyOn(userChangesService, "changesFor").and.callFake((user) => {
            return promise.create((fulfill, reject) => {
                if (user.id === 2222) return reject("error getting changes");
                fulfill(null);
            });
        });

        service.run()
            .then(null, (error) => {
                expect(error).toBe("error getting changes");
                done();
            });
    });

    it("broadcasts all the changes", function(done){
        setupSomeUsers([1111, 2222, 4444]);
        seededUserScheduleResult = [1111, 2222, 4444];
        spyOn(userChangesService, "changesFor").and.callFake((user) => {
            return promise.create((fulfill, reject) => {
                if (user.id === 1111) return fulfill(["change1", "change2"]);
                if (user.id === 2222) return fulfill(["changeb", "changec"]);
                if (user.id === 4444) return fulfill(["change3", "change4"]);
                reject("unknown user");
            });
        });
        var broadcastedChanges = [];
        spyOn(changesBroadcastService, "broadcast").and.callFake(function(changes){
            return promise.create((fulfill, reject) => {
                broadcastedChanges = broadcastedChanges.concat(changes);
                fulfill();
            });
        });

        service.run()
            .then(() => {
                expect(broadcastedChanges).toEqual([
                    "change1", "change2", "changeb",
                    "changec", "change3", "change4"
                ]);
                done();
            });
    });

    it("fails on broadcast error", function(done){
        setupSomeUsers([1111]);
        seededUserScheduleResult = [1111];
        spyOn(userChangesService, "changesFor").and.callFake((user) => {
            return promise.create((fulfill, reject) => {
                fulfill(["change1", "change2"]);
            });
        });
        setupBroadcast("error broadcasting data");

        service.run()
            .then(null, (error) => {
                expect(error).toBe("error broadcasting data");
                done();
            });
    });
});