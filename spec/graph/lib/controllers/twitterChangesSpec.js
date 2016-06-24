var rfr = require("rfr");
var twitterChangesController = rfr("lib/controllers/twitterChanges");

describe("twitterChanges", function() {
    var res = {
        name: "my web response",
        send: () => {}
    };
    var db = "my database";
    var controller = null;
    var webError = null;
    var twitterChanges = null;
    var twitterGraph = null;

    beforeEach(function(){
        spyOn(res, "send");

        webError = {
            unauthorized: function(){},
            unexpected: function(){},
            notFound: function(){}
        };
        spyOn(webError, "unauthorized");
        spyOn(webError, "unexpected");
        spyOn(webError, "notFound");

        var apiKey = {
            isValid: (key) => {
                return key === "my secret key";
            }
        };

        var dbConnection = (r) => {
            if (r === res){
                return {
                    then: (successCallback, errorCallback) =>{
                        successCallback(db);
                    }
                };
            }
        };

        twitterChanges = {
            changesFor: function(){}
        };
        var twitterChangesFactory = (pDb) => {
            if (pDb === db){
                return twitterChanges;
            }
        };

        twitterGraph = {
            first: function(){},
            graphsForUserCreatedAfter: function(){}
        };
        var twitterGraphFactory = (pDb) => {
            if (pDb === db){
                return twitterGraph;
            }
        };

        controller = twitterChangesController(
            dbConnection,
            twitterChangesFactory,
            twitterGraphFactory,
            apiKey,
            webError);
    });

    function changesForWillReturn(result){
        spyOn(twitterChanges, "changesFor").and.callFake((twitterChangesId) => {
            if (twitterChangesId === "my twitter user id"){
                return {
                    then: (successCallback, errorCallback) => {
                        successCallback(result);
                    }
                };
            }
        });
    }

    function changesForWillFail(error){
        spyOn(twitterChanges, "changesFor").and.callFake((twitterChangesId) => {
            return {
                then: (successCallback, errorCallback) => {
                    errorCallback(error);
                }
            };
        });
    }

    describe("list", function(){
        it("returns unauthorized when the api key is invalid", function(){
            controller.list("my twitter user id", "invalid key", res);

            expect(webError.unauthorized).toHaveBeenCalledWith(res, "Unauthorized");
        });

        it("returns unexpected when the changes could not be read", function(){
            changesForWillFail("seeded error");

            controller.list("my twitter user id", "my secret key", res);

            expect(webError.unexpected).toHaveBeenCalledWith(
                res, "Error reading changes", "seeded error"
            );
        });

        it("returns notfound when the user could not be found", function(){
            changesForWillReturn(null);

            controller.list("my twitter user id", "my secret key", res);

            expect(webError.notFound).toHaveBeenCalledWith(
                res, "Changes not found"
            );
        });

        it("returns the twitter changes list", function(){
            changesForWillReturn([
                {
                    _id: {
                        $oid: "5728975ff290838461287aed"
                    },
                    type: "unfriend",
                    originator: "29893096",
                    target: 2445809510,
                    prevId: "3bb90400-1122-11e6-8af8-31707a964af4",
                    currId: "50bb43c0-1129-11e6-a59f-6f2338f57d82",
                    version: 1,
                    modified_time_str: "2016-05-03T12:19:43.085Z"
                },
                {
                    _id: {
                        $oid: "5728aeeadc9bd2ae001d55b7"
                    },
                    type: "follow",
                    originator: 42583204,
                    target: "29893096",
                    prevId: "27bbeb50-1133-11e6-96ba-97164deb9f57",
                    currId: "57f81b51-1137-11e6-9696-855fca69220d",
                    version: 1,
                    modified_time_str: "2016-05-03T14:00:10.035Z"
                }
            ]);

            controller.list("my twitter user id", "my secret key", res);

            expect(res.send).toHaveBeenCalledWith([
                {
                    type: "unfriend",
                    originator: "29893096",
                    target: 2445809510,
                    prevId: "3bb90400-1122-11e6-8af8-31707a964af4",
                    currId: "50bb43c0-1129-11e6-a59f-6f2338f57d82"
                },
                {
                    type: "follow",
                    originator: 42583204,
                    target: "29893096",
                    prevId: "27bbeb50-1133-11e6-96ba-97164deb9f57",
                    currId: "57f81b51-1137-11e6-9696-855fca69220d"
                }
            ]);
        });

        it("returns the twitter changes list sorted by id", function(){
            changesForWillReturn([
                {
                    _id: "999999",
                    type: "unfriend",
                    originator: "29893096",
                    target: 2445809510,
                    prevId: "3bb90400-1122-11e6-8af8-31707a964af4",
                    currId: "50bb43c0-1129-11e6-a59f-6f2338f57d82",
                    version: 1,
                    modified_time_str: "2016-05-03T12:19:43.085Z"
                },
                {
                    _id: "111111",
                    type: "follow",
                    originator: 42583204,
                    target: "29893096",
                    prevId: "27bbeb50-1133-11e6-96ba-97164deb9f57",
                    currId: "57f81b51-1137-11e6-9696-855fca69220d",
                    version: 1,
                    modified_time_str: "2016-05-03T14:00:10.035Z"
                }
            ]);

            controller.list("my twitter user id", "my secret key", res);

            expect(res.send).toHaveBeenCalledWith([
                {
                    type: "follow",
                    originator: 42583204,
                    target: "29893096",
                    prevId: "27bbeb50-1133-11e6-96ba-97164deb9f57",
                    currId: "57f81b51-1137-11e6-9696-855fca69220d"
                },
                {
                    type: "unfriend",
                    originator: "29893096",
                    target: 2445809510,
                    prevId: "3bb90400-1122-11e6-8af8-31707a964af4",
                    currId: "50bb43c0-1129-11e6-a59f-6f2338f57d82"
                }
            ]);
        });
    });

    describe("changesAfter", function(){
        function twitterGraphFirstWillReturn(result){
            spyOn(twitterGraph, "first").and.callFake((graphId) => {
                if (graphId === "my graph id"){
                    return {
                        then: (successCallback, errorCallback) => {
                            successCallback(result);
                        }
                    };
                }
            });
        }

        function graphsForUserCreatedAfterWillReturn(result){
            spyOn(twitterGraph, "graphsForUserCreatedAfter").and.callFake((graph) => {
                if (graph.id === "my twitter user id"){
                    return {
                        then: (successCallback, errorCallback) => {
                            successCallback(result);
                        }
                    };
                }
            });
        }

        it("returns unauthorized when the api key is invalid", function(){
            controller.changesForUserCreatedAfter("my graph id", "invalid key", res);

            expect(webError.unauthorized).toHaveBeenCalledWith(res, "Unauthorized");
        });

        it("reads the graph details", function(){
            twitterGraphFirstWillReturn({
                id: "my twitter user id"
            });
            graphsForUserCreatedAfterWillReturn(null);
            changesForWillReturn(null);

            controller.changesForUserCreatedAfter("my graph id", "my secret key", res);

            expect(twitterGraph.first).toHaveBeenCalledWith("my graph id");
        });

        it("returns not found when the graph could not be found", function(){
            twitterGraphFirstWillReturn(null);

            controller.changesForUserCreatedAfter("my graph id", "my secret key", res);

            expect(webError.notFound).toHaveBeenCalledWith(
                res, "Graph not found"
            );
        });

        it("returns unexpected when the graph details could not be read", function(){
            spyOn(twitterGraph, "first").and.callFake((graphId) => {
                return {
                    then: (successCallback, errorCallback) => {
                        errorCallback("seeded error");
                    }
                };
            });

            controller.changesForUserCreatedAfter("my graph id", "my secret key", res);

            expect(webError.unexpected).toHaveBeenCalledWith(
                res, "Error finding graph", "seeded error"
            );
        });

        it("reads the graphs for the user created after the target graph", function(){
            twitterGraphFirstWillReturn({
                id: "my twitter user id"
            });
            graphsForUserCreatedAfterWillReturn(null);
            changesForWillReturn(null);

            controller.changesForUserCreatedAfter("my graph id", "my secret key", res);

            expect(twitterGraph.graphsForUserCreatedAfter).toHaveBeenCalledWith({
                id: "my twitter user id"
            });
        });

        it("returns not found when there were no graphs created after the target graph", function(){
            twitterGraphFirstWillReturn({
                id: "my twitter user id"
            });
            graphsForUserCreatedAfterWillReturn(null);

            controller.changesForUserCreatedAfter("my graph id", "my secret key", res);

            expect(webError.notFound).toHaveBeenCalledWith(
                res, "Graph list not found"
            );
        });

        it("returns unexpected when the graphs created after could not be read", function(){
            twitterGraphFirstWillReturn({
                id: "my twitter user id"
            });
            spyOn(twitterGraph, "graphsForUserCreatedAfter").and.callFake((twitterGraph) => {
                return {
                    then: (successCallback, errorCallback) => {
                        errorCallback("seeded error");
                    }
                };
            });

            controller.changesForUserCreatedAfter("my graph id", "my secret key", res);

            expect(webError.unexpected).toHaveBeenCalledWith(
                res, "Error reading user graphs", "seeded error"
            );
        });

        it("reads the changes for each graph and the twitter user", function(){
            twitterGraphFirstWillReturn({
                id: "my twitter user id"
            });
            graphsForUserCreatedAfterWillReturn([
                {graphId: "id1"},
                {graphId: "id2"},
                {graphId: "id3"}
            ]);
            changesForWillReturn(null);

            controller.changesForUserCreatedAfter("my graph id", "my secret key", res);

            expect(twitterChanges.changesFor).toHaveBeenCalledWith(
                "my twitter user id", ["id1", "id2", "id3"]
            );
        });

        it("returns not found when there were no changes", function(){
            twitterGraphFirstWillReturn({
                id: "my twitter user id"
            });
            graphsForUserCreatedAfterWillReturn([
                {graphId: "id1"},
                {graphId: "id2"},
                {graphId: "id3"}
            ]);
            changesForWillReturn(null);

            controller.changesForUserCreatedAfter("my graph id", "my secret key", res);

            expect(webError.notFound).toHaveBeenCalledWith(
                res, "Changes not found"
            );
        });

        it("returns unexpected when the changes could not be read", function(){
            twitterGraphFirstWillReturn({
                id: "my twitter user id"
            });
            graphsForUserCreatedAfterWillReturn([]);
            changesForWillFail("seeded error");

            controller.changesForUserCreatedAfter("my graph id", "my secret key", res);

            expect(webError.unexpected).toHaveBeenCalledWith(
                res, "Error reading changes", "seeded error"
            );
        });

        it("returns the changes data", function(){
            twitterGraphFirstWillReturn({
                id: "my twitter user id"
            });
            graphsForUserCreatedAfterWillReturn([
                {graphId: "id1"},
                {graphId: "id2"},
                {graphId: "id3"}
            ]);
            changesForWillReturn([
                {
                    _id: {
                        $oid: "5728975ff290838461287aed"
                    },
                    type: "unfriend",
                    originator: "29893096",
                    target: 2445809510,
                    prevId: "3bb90400-1122-11e6-8af8-31707a964af4",
                    currId: "50bb43c0-1129-11e6-a59f-6f2338f57d82",
                    version: 1,
                    modified_time_str: "2016-05-03T12:19:43.085Z"
                },
                {
                    _id: {
                        $oid: "5728aeeadc9bd2ae001d55b7"
                    },
                    type: "follow",
                    originator: 42583204,
                    target: "29893096",
                    prevId: "27bbeb50-1133-11e6-96ba-97164deb9f57",
                    currId: "57f81b51-1137-11e6-9696-855fca69220d",
                    version: 1,
                    modified_time_str: "2016-05-03T14:00:10.035Z"
                }
            ]);

            controller.changesForUserCreatedAfter("my graph id", "my secret key", res);

            expect(res.send).toHaveBeenCalledWith([
                {
                    type: "unfriend",
                    originator: "29893096",
                    target: 2445809510,
                    prevId: "3bb90400-1122-11e6-8af8-31707a964af4",
                    currId: "50bb43c0-1129-11e6-a59f-6f2338f57d82"
                },
                {
                    type: "follow",
                    originator: 42583204,
                    target: "29893096",
                    prevId: "27bbeb50-1133-11e6-96ba-97164deb9f57",
                    currId: "57f81b51-1137-11e6-9696-855fca69220d"
                }
            ]);
        });

        it("returns the changes data sorted by id", function(){
            twitterGraphFirstWillReturn({
                id: "my twitter user id"
            });
            graphsForUserCreatedAfterWillReturn([
                {graphId: "id1"},
                {graphId: "id2"},
                {graphId: "id3"}
            ]);
            changesForWillReturn([
                {
                    _id: "22222",
                    type: "unfriend",
                    originator: "29893096",
                    target: 2445809510,
                    prevId: "3bb90400-1122-11e6-8af8-31707a964af4",
                    currId: "50bb43c0-1129-11e6-a59f-6f2338f57d82",
                    version: 1,
                    modified_time_str: "2016-05-03T12:19:43.085Z"
                },
                {
                    _id: "11111",
                    type: "follow",
                    originator: 42583204,
                    target: "29893096",
                    prevId: "27bbeb50-1133-11e6-96ba-97164deb9f57",
                    currId: "57f81b51-1137-11e6-9696-855fca69220d",
                    version: 1,
                    modified_time_str: "2016-05-03T14:00:10.035Z"
                }
            ]);

            controller.changesForUserCreatedAfter("my graph id", "my secret key", res);

            expect(res.send).toHaveBeenCalledWith([
                {
                    type: "follow",
                    originator: 42583204,
                    target: "29893096",
                    prevId: "27bbeb50-1133-11e6-96ba-97164deb9f57",
                    currId: "57f81b51-1137-11e6-9696-855fca69220d"
                },
                {
                    type: "unfriend",
                    originator: "29893096",
                    target: 2445809510,
                    prevId: "3bb90400-1122-11e6-8af8-31707a964af4",
                    currId: "50bb43c0-1129-11e6-a59f-6f2338f57d82"
                }
            ]);
        });
    });
});