var rfr = require("rfr");
var promise = require("the-promise-factory");
var userChangesService = rfr("usergraph/lib/services/userChangesService.js");

describe("userChangesService", function(){
    var user = {
        id: 5,
        userName: "potus"
    };

    var twittterGraphBuilder = null;
    var twittterGraphDataService = null;
    var changesStreamBuilder = null;
    var userScheduleDataService = null;
    var service = null;

    beforeEach(function(){
        twittterGraphBuilder = {
            buildGraphFor: function(){}
        };

        twittterGraphDataService = {
            first: function(){},
            save: function(){},
            saveHistory: function(){}
        }

        changesStreamBuilder = {
            getChanges: function(){}
        };

        userScheduleDataService = {
            update: function(){}
        }

        spyOn(console, "log");

        service = userChangesService(
            twittterGraphBuilder,
            twittterGraphDataService,
            changesStreamBuilder,
            userScheduleDataService
        );
    });

    function readPreviousGraphWillReturn(result) {
        spyOn(twittterGraphDataService, "first").and.callFake((id) => {
            return promise.create((fulfill, reject) => {
                if (id !== user.id) return jasmine.getEnv().fail("invalid invocation");

                fulfill(result);
            });
        });
    }

    function buildGraphWillReturn(result){
        spyOn(twittterGraphBuilder, "buildGraphFor").and.callFake((registeredUser) => {
            return promise.create((fulfill, reject) => {
                if (registeredUser !== user) return jasmine.getEnv().fail("invalid invocation");

                fulfill(result);
            });
        });
    }

    function saveGraphWillReturn(result){
        spyOn(twittterGraphDataService, "save").and.callFake((twitterGraph) => {
            return promise.create((fulfill, reject) => {
                fulfill(result);
            });
        });
    }

    function saveHistoryWillReturn(result){
        spyOn(twittterGraphDataService, "saveHistory").and.callFake((twitterGraph) => {
            return promise.create((fulfill, reject) => {
                fulfill(result);
            });
        });
    }

    function getChangesWillReturn(result){
        spyOn(changesStreamBuilder, "getChanges").and.callFake((currentGraph, previousGraph) => {
            return promise.create((fulfill, reject) => {
                fulfill(result);
            });
        });
    }

    function updateUserScheduleWillReturn(result){
        spyOn(userScheduleDataService, "update").and.callFake((userId) => {
            return promise.create((fulfill, reject) => {
                fulfill(result);
            });
        });
    }

    it("builds the graph for the user", function(done){
        readPreviousGraphWillReturn(null);
        buildGraphWillReturn(null);
        getChangesWillReturn(null);
        saveGraphWillReturn(null);
        saveHistoryWillReturn(null);
        updateUserScheduleWillReturn(null);

        service.changesFor(user)
            .then(() => {
                expect(twittterGraphBuilder.buildGraphFor).toHaveBeenCalledWith(user);
                done();
            });
    });

    it("fails if the graph could not be built", function(done){
        updateUserScheduleWillReturn(null);
        readPreviousGraphWillReturn(null);
        spyOn(twittterGraphBuilder, "buildGraphFor").and.callFake((registeredUser) => {
            return promise.create((fulfill, reject) => {
                reject("something went wrong");
            });
        });

        service.changesFor(user)
            .then(null, (error) => {
                expect(error).toBe("something went wrong");
                done();
            });
    });

    it("updates the user schedule", function(done){
        readPreviousGraphWillReturn(null);
        buildGraphWillReturn(null);
        getChangesWillReturn(null);
        saveGraphWillReturn(null);
        saveHistoryWillReturn(null);
        updateUserScheduleWillReturn(null);

        service.changesFor(user)
            .then(() => {
                expect(userScheduleDataService.update).toHaveBeenCalledWith(user.id);
                done();
            });
    });

    it("fails if the user schedule could not be updated", function(done){
        readPreviousGraphWillReturn(null);
        buildGraphWillReturn(null);
        spyOn(userScheduleDataService, "update").and.callFake((userId) => {
            return promise.create((fulfill, reject) => {
                reject("something went wrong");
            });
        });

        service.changesFor(user)
            .then(null, (error) => {
                expect(error).toBe("something went wrong");
                done();
            });
    });

    it("reads the previously stored twitter graph for the user", function(){
        readPreviousGraphWillReturn(null);

        service.changesFor(user);

        expect(twittterGraphDataService.first).toHaveBeenCalledWith(user.id);
    });

    it("fails if the previous graph could not be read", function(done){
        buildGraphWillReturn(null);
        updateUserScheduleWillReturn(null);
        spyOn(twittterGraphDataService, "first").and.callFake((id) => {
            return promise.create((fulfill, reject) => {
                reject("oops something went wrong");
            });
        });

        service.changesFor(user)
            .then(null, (error) => {
                expect(error).toBe("oops something went wrong");
                done();
            });
    });

    it("returns the changes", function(done){
        var seededPreviousGraph = {name: '111'};
        var seededCurrentGraph = {weight: '55'};
        readPreviousGraphWillReturn(seededPreviousGraph);
        buildGraphWillReturn(seededCurrentGraph);
        saveGraphWillReturn(null);
        saveHistoryWillReturn(null);
        updateUserScheduleWillReturn(null);
        getChangesWillReturn([6666, 777, 8888]);

        service.changesFor(user)
            .then((changes) => {
                expect(changes).toEqual([6666, 777, 8888]);
                expect(changesStreamBuilder.getChanges)
                    .toHaveBeenCalledWith(seededCurrentGraph, seededPreviousGraph);
                done();
            });
    });

    it("fails when the changes could not be calculated", function(){
        updateUserScheduleWillReturn(null); 
        readPreviousGraphWillReturn({name: '111'});
        buildGraphWillReturn({weight: '55'});
        spyOn(changesStreamBuilder, "getChanges").and.callFake((currentGraph, previousGraph) => {
            return promise.create((fulfill, reject) => {
                reject("changes failed damn it");
            });
        });

        service.changesFor(user)
            .then(null, (error) => {
                expect(error).toBe("changes failed damn it");
                done();
            });
    });

    it("saves the current twitterGraph when there are changes", function(done){
        var seededCurrentGraph = {id: 45};
        readPreviousGraphWillReturn(null);
        updateUserScheduleWillReturn(null);
        buildGraphWillReturn(seededCurrentGraph);
        getChangesWillReturn([1111, 3333, 5555]);
        saveGraphWillReturn(null);
        saveHistoryWillReturn(null);

        service.changesFor(user)
            .then((changes) => {
                expect(twittterGraphDataService.save).toHaveBeenCalledWith(seededCurrentGraph);
                done();
            });
    });

    it("saves the current twitterGraph when there are no changes but there is no previous graph", function(done){
        var seededCurrentGraph = {id: 45};
        readPreviousGraphWillReturn(null);
        buildGraphWillReturn(seededCurrentGraph);
        getChangesWillReturn([]);
        updateUserScheduleWillReturn(null);
        saveGraphWillReturn(null);
        saveHistoryWillReturn(null);

        service.changesFor(user)
            .then((changes) => {
                expect(twittterGraphDataService.save).toHaveBeenCalledWith(seededCurrentGraph);
                done();
            });
    });

    it("does not save the current twitterGraph when there are no changes", function(done){
        readPreviousGraphWillReturn({id: 44});
        buildGraphWillReturn({id: 45});
        getChangesWillReturn([]);
        updateUserScheduleWillReturn(null);
        saveGraphWillReturn(null);
        saveHistoryWillReturn(null);

        service.changesFor(user)
            .then((changes) => {
                expect(twittterGraphDataService.save).not.toHaveBeenCalled();
                done();
            });
    });

    it("saves the current twitterGraph when there are no changes but there was no previous graph either", function(done){
        var seededCurrentGraph = {id: 45};
        readPreviousGraphWillReturn(null);
        buildGraphWillReturn(seededCurrentGraph);
        getChangesWillReturn([]);
        updateUserScheduleWillReturn(null);
        saveGraphWillReturn(null);
        saveHistoryWillReturn(null);

        service.changesFor(user)
            .then((changes) => {
                expect(twittterGraphDataService.save).toHaveBeenCalledWith(seededCurrentGraph);
                done();
            });
    });

    it("fails when saving the current graph failed", function(done){
        readPreviousGraphWillReturn(null);
        buildGraphWillReturn(null);
        updateUserScheduleWillReturn(null);
        getChangesWillReturn([1111, 444]);
        spyOn(twittterGraphDataService, "save").and.callFake((id) => {
            return promise.create((fulfill, reject) => {
                reject("could not save");
            });
        });

        service.changesFor(user)
            .then(null, (error) => {
                expect(error).toBe("could not save");
                done();
            });
    });

    it("saves the current twitterGraph to the history when there are changes", function(done){
        var seededCurrentGraph = {id: 45};
        updateUserScheduleWillReturn(null);
        readPreviousGraphWillReturn(null);
        buildGraphWillReturn(seededCurrentGraph);
        getChangesWillReturn([333, 555, 6666]);
        saveGraphWillReturn(null);
        saveHistoryWillReturn(null);

        service.changesFor(user)
            .then((changes) => {
                expect(twittterGraphDataService.saveHistory).toHaveBeenCalledWith(seededCurrentGraph);
                done();
            });
    });

    it("does not save the current twitterGraph to the history when there are no changes", function(done){
        readPreviousGraphWillReturn({name: '111'});
        buildGraphWillReturn({id: 45});
        getChangesWillReturn([]);
        saveGraphWillReturn(null);
        saveHistoryWillReturn(null);
        updateUserScheduleWillReturn(null);

        service.changesFor(user)
            .then((changes) => {
                expect(twittterGraphDataService.saveHistory).not.toHaveBeenCalled();
                done();
            });
    });

    it("saves the current twitterGraph to the history when there are no changes but there was no previous graph either", function(done){
        var seededCurrentGraph = {id: 45};
        readPreviousGraphWillReturn(null);
        buildGraphWillReturn(seededCurrentGraph);
        getChangesWillReturn([]);
        saveGraphWillReturn(null);
        saveHistoryWillReturn(null);
        updateUserScheduleWillReturn(null);

        service.changesFor(user)
            .then((changes) => {
                expect(twittterGraphDataService.saveHistory).toHaveBeenCalledWith(seededCurrentGraph);
                done();
            });
    });

    it("fails when saving the current graph history failed", function(done){
        readPreviousGraphWillReturn(null);
        buildGraphWillReturn(null);
        getChangesWillReturn([111, 2222]);
        saveGraphWillReturn(null);
        updateUserScheduleWillReturn(null);
        spyOn(twittterGraphDataService, "saveHistory").and.callFake((id) => {
            return promise.create((fulfill, reject) => {
                reject("could not save history");
            });
        });

        service.changesFor(user)
            .then(null, (error) => {
                expect(error).toBe("could not save history");
                done();
            });
    });
});