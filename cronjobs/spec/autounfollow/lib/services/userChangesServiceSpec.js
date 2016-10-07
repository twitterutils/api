var rfr = require("rfr");
var promise = require("the-promise-factory");
var userChangesService = rfr("autounfollow/lib/services/userChangesService");

describe("userChangesService", function() {
    var dataService = null;
    var userStatusDataServiceMock = null;
    var graphDataServiceMock = null;

    var seededUserStatusFirst;
    var seededUserStatusFirstError;

    var seededUserStatusSave;
    var seededUserStatusSaveError;

    var seededUserDetails;
    var seededUserDetailsError;

    var seededUserChanges;
    var seededUserChangesError;

    var seededRecentChanges;
    var seededRecentChangesError;

    beforeEach(function(){
        userStatusDataServiceMock = {
            first: () => {},
            save: () => {}
        };

        seededUserStatusFirst = undefined;
        seededUserStatusFirstError = undefined;
        spyOn(userStatusDataServiceMock, "first").and.callFake(function(userId){
            return promise.create((fulfill, reject) => {
                if (userId === "myuserid"){
                    if (seededUserStatusFirst !== undefined){
                        return fulfill(seededUserStatusFirst);
                    }

                    if (seededUserStatusFirstError !== undefined){
                        return reject(seededUserStatusFirstError);
                    }
                }

                throw new Error("Invalid first mock");
            })
        });

        seededUserStatusSave = undefined;
        seededUserStatusSaveError = undefined;
        spyOn(userStatusDataServiceMock, "save").and.callFake(function(userId, graphId){
            return promise.create((fulfill, reject) => {
                if (seededUserStatusSave !== undefined){
                    return fulfill(seededUserStatusSave);
                }

                if (seededUserStatusSaveError !== undefined){
                    return reject(seededUserStatusSaveError);
                }

                throw new Error("Invalid save mock");
            })
        });

        graphDataServiceMock = {
            userDetails: () => {},
            userChanges: () => {},
            recentChanges: () => {}
        };

        seededUserDetails = undefined;
        seededUserDetailsError = undefined;
        spyOn(graphDataServiceMock, "userDetails").and.callFake(function(userId){
            return promise.create((fulfill, reject) => {
                if (seededUserDetails !== undefined){
                    return fulfill(seededUserDetails);
                }

                if (seededUserDetailsError !== undefined){
                    return reject(seededUserDetailsError);
                }

                throw new Error("Invalid userDetails mock");
            })
        });

        seededUserChanges = undefined;
        seededUserChangesError = undefined;
        spyOn(graphDataServiceMock, "userChanges").and.callFake(function(userId){
            return promise.create((fulfill, reject) => {
                if (userId === "myuserid"){
                    if (seededUserChanges !== undefined){
                        return fulfill(seededUserChanges);
                    }

                    if (seededUserChangesError !== undefined){
                        return reject(seededUserChangesError);
                    }
                }

                throw new Error("Invalid userChanges mock");
            })
        });

        seededRecentChanges = undefined;
        seededRecentChangesError = undefined;
        spyOn(graphDataServiceMock, "recentChanges").and.callFake(function(graphId){
            return promise.create((fulfill, reject) => {
                if (graphId === "previousGraphId"){
                    if (seededRecentChanges !== undefined){
                        return fulfill(seededRecentChanges);
                    }

                    if (seededRecentChangesError !== undefined){
                        return reject(seededRecentChangesError);
                    }
                }

                throw new Error("Invalid recentChanges mock");
            })
        });

        dataService = userChangesService(userStatusDataServiceMock, graphDataServiceMock);
    });

    it("reads the user status", function(){
        seededUserStatusFirst = null;

        dataService.read({id: "myuserid"});

        expect(userStatusDataServiceMock.first).toHaveBeenCalledWith("myuserid");
    });

    it("fails when user status could not be read", function(done){
        seededUserDetails = {id: "userDetailsId", graphId: "userDetailsGraph"};
        seededUserStatusFirstError = "error reading user status";

        dataService
            .read({id: "myuserid"})
            .then(null, (error) => {
                expect(error).toBe("error reading user status");
                done();
            });
    });

    it("reads all the changes when there is no saved status", function(done){
        seededUserStatusFirst = null;
        seededUserChanges = ["change 1", "change 2"];
        seededUserDetails = {id: "userDetailsId", graphId: "userDetailsGraph"};
        seededUserStatusSave = {};

        dataService
            .read({id: "myuserid"})
            .then((result) => {
                expect(result.changes).toEqual(["change 1", "change 2"]);
                expect(result.userDetails).toEqual({id: "userDetailsId", graphId: "userDetailsGraph"});
                done();
            });
    });

    it("fails when all the changes could not be read", function(done){
        seededUserStatusFirst = null;
        seededUserDetails = {id: "userDetailsId", graphId: "userDetailsGraph"};
        seededUserChangesError = "error reading user changes";

        dataService
            .read({id: "myuserid"})
            .then(null, (error) => {
                expect(error).toBe("error reading user changes");
                done();
            });
    });

    it("reads the recent changes when there is a previous status", function(done){
        seededUserStatusFirst = {graphId: "previousGraphId"};
        seededRecentChanges = ["recentchange 1", "recentchange 2"];
        seededUserDetails = {id: "userDetailsId", graphId: "userDetailsGraph"};
        seededUserStatusSave = {};

        dataService
            .read({id: "myuserid"})
            .then((result) => {
                expect(result.changes).toEqual(["recentchange 1", "recentchange 2"]);
                expect(result.userDetails).toEqual({id: "userDetailsId", graphId: "userDetailsGraph"});
                done();
            });
    });

    it("fails when the recent changes could not be read", function(done){
        seededUserStatusFirst = {graphId: "previousGraphId"};
        seededUserDetails = {id: "userDetailsId", graphId: "userDetailsGraph"};
        seededRecentChangesError = "error reading recent changes";

        dataService
            .read({id: "myuserid"})
            .then(null, (error) => {
                expect(error).toBe("error reading recent changes");
                done();
            });
    });

    it("reads the user details when there is no saved status", function(done){
        seededUserStatusFirst = null;
        seededUserChanges = ["change 1", "change 2"];
        seededUserDetails = {id: "userDetailsId", graphId: "userDetailsGraph"};
        seededUserStatusSave = {};

        dataService
            .read({id: "myuserid"})
            .then((result) => {
                expect(graphDataServiceMock.userDetails).toHaveBeenCalledWith("myuserid");
                done();
            });
    });

    it("reads the user details even when there is a saved status", function(done){
        seededUserStatusFirst = {graphId: "previousGraphId"};
        seededRecentChanges = ["change 1", "change 2"];
        seededUserDetails = {id: "userDetailsId", graphId: "userDetailsGraph"};
        seededUserStatusSave = {};

        dataService
            .read({id: "myuserid"})
            .then((result) => {
                expect(graphDataServiceMock.userDetails).toHaveBeenCalledWith("myuserid");
                done();
            });
    });

    it("fails when the user details could not be read", function(done){
        seededUserStatusFirst = null;
        seededUserChanges = ["change 1", "change 2"];
        seededUserDetailsError = "error reading user details";

        dataService
            .read({id: "myuserid"})
            .then(null, (error) => {
                expect(error).toBe("error reading user details");
                done();
            });
    });

    it("updates the user status", function(done){
        seededUserStatusFirst = null;
        seededUserChanges = ["change 1", "change 2"];
        seededUserDetails = {id: "userDetailsId", graphId: "userDetailsGraph"};
        seededUserStatusSave = {};

        dataService
            .read({id: "myuserid"})
            .then((result) => {
                expect(userStatusDataServiceMock.save).toHaveBeenCalledWith("userDetailsId", "userDetailsGraph");
                done();
            });
    });

    it("fails when the user status could not be saved", function(done){
        seededUserStatusFirst = null;
        seededUserChanges = ["change 1", "change 2"];
        seededUserDetails = {id: "userDetailsId", graphId: "userDetailsGraph"};
        seededUserStatusSaveError = "error saving user status";

        dataService
            .read({id: "myuserid"})
            .then(null, (error) => {
                expect(error).toBe("error saving user status");
                done();
            });
    });
});