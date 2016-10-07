var rfr = require("rfr");
var userIdsReader = rfr("username/lib/services/userIdsReader");

describe("userIdsReader", function () {
    var service = null;
    var readUserDetails = null;
    var seededUserDetailsError = null;
    var readGraphIds = null;
    var readChanges = null;
    var idGeneratorGraphFn = null;
    var idGeneratorChangesFn = null;
    var readUserIds = null;
    var seededUserChangesError = null;
    var userChangesGeneratorFn = null;

    beforeEach(function(){
        readUserDetails = [];
        seededUserDetailsError = null;
        var graphDataServiceStub = {
            userDetails: (userId) => {
                readUserDetails.push(userId);

                return {
                    then: (fulfill, reject) => {
                        if (seededUserDetailsError) {
                            reject(seededUserDetailsError);
                            return;
                        }

                        fulfill({
                            id: userId
                        });
                    }
                }
            }
        };

        readUserIds = [];
        seededUserChangesError = null;
        userChangesGeneratorFn = (userId) => {
            return []
        };
        var changesDataServiceStub = {
            userChanges: (userId) => {
                readUserIds.push(userId);

                return {
                    then: (fulfill, reject) => {
                        if (seededUserChangesError){
                            reject(seededUserChangesError);
                            return;
                        }

                        fulfill(userChangesGeneratorFn(userId));
                    }
                }
            }
        };

        readGraphIds = [];
        idGeneratorGraphFn = (graphId) => {
            return [];
        };
        readChanges = [];
        idGeneratorChangesFn = (changes) => {
            var result = changes.map((c) => {
                return [
                    c.originator,
                    c.target
                ];
            });
            return [].concat.apply([], result);
        };
        var userIdHelper = {
            getUserIdsFromGraph: (graph) => {
                readGraphIds.push(graph.id);

                return idGeneratorGraphFn(graph.id);
            },
            getUserIdsFromChanges: (changes) => {
                readChanges.push(changes);

                return idGeneratorChangesFn(changes);
            },
            concatIds: (ids1, ids2) => {
                return rfr("username/lib/helpers/userIdHelper")().concatIds(ids1, ids2);
            }
        };

        service = userIdsReader(graphDataServiceStub, changesDataServiceStub, userIdHelper);
    });

    it ("reads the graph for each user", function(done){
        service.getAllIdsFor([
            {id: "1111"},
            {id: "3333"},
            {id: "4444"}
        ]).then(() => {
            expect(readUserDetails).toEqual([
                "1111", "3333", "4444"
            ]);
            done();
        });
    });

    it ("fails when at least a graph could not be read", function(done){
        seededUserDetailsError = "graph read failure";

        service.getAllIdsFor([
            {id: "1111"}
        ]).then(null, (err) =>{
            expect(err).toBe("graph read failure");
            done();
        });
    });

    it ("extracts all the ids for each graph", function(done){
        service.getAllIdsFor([
            {id: "1111"},
            {id: "3333"},
            {id: "4444"}
        ]).then(() => {
            expect(readGraphIds).toEqual([
                "1111", "3333", "4444"
            ]);
            done();
        });
    });

    it ("retrieves all the ids for every user", function(done){
        idGeneratorGraphFn = (graphId) => {
            return [
                "5555" + graphId,
                "6666" + graphId,
                "7777" + graphId
            ];
        };

        service.getAllIdsFor([
            {id: "1111"},
            {id: "3333"},
            {id: "4444"}
        ]).then((ids) => {
            expect(ids).toEqual([
                "55551111", "66661111", "77771111",
                "55553333", "66663333", "77773333",
                "55554444", "66664444", "77774444"
            ]);
            done();
        });
    });

    it ("retrieves only uniq ids", function(done){
        idGeneratorGraphFn = (graphId) => {
            return [
                "5555" + graphId,
                "0000"
            ];
        };

        service.getAllIdsFor([
            {id: "1111"},
            {id: "3333"},
            {id: "4444"}
        ]).then((ids) => {
            expect(ids).toEqual([
                "55551111", "0000",
                "55553333",
                "55554444",
            ]);
            done();
        });
    });

    it ("reads the changes for each user", function(done){
        service.getAllIdsFor([
            {id: "1111"},
            {id: "3333"},
            {id: "4444"}
        ]).then(() => {
            expect(readUserIds).toEqual([
                "1111", "3333", "4444"
            ]);
            done();
        });
    });

    it ("fails when at one user changes could not be read", function(done){
        seededUserChangesError = "changes read failure";

        service.getAllIdsFor([
            {id: "1111"}
        ]).then(null, (err) =>{
            expect(err).toBe("changes read failure");
            done();
        });
    });

    it ("extract the userIds from the changes", function(done){
        userChangesGeneratorFn = (userId) => {
            return [
                { originator: userId, target: "11111" + userId },
                { originator: userId, target: "22222" + userId }
            ];
        }

        service.getAllIdsFor([
            {id: "1111"},
            {id: "3333"},
            {id: "4444"}
        ]).then(() => {
            expect([].concat.apply([], readChanges)).toEqual([
                { originator: "1111", target: "111111111" },
                { originator: "1111", target: "222221111" },
                { originator: "3333", target: "111113333" },
                { originator: "3333", target: "222223333" },
                { originator: "4444", target: "111114444" },
                { originator: "4444", target: "222224444" }
            ]);
            done();
        });
    });

    it ("retrieves all the ids for every change", function(done){
        userChangesGeneratorFn = (userId) => {
            return [
                { originator: userId + "555", target: "11111" + userId },
                { originator: userId + "666", target: "22222" + userId }
            ];
        }

        service.getAllIdsFor([
            {id: "1111"},
            {id: "3333"}
        ]).then((ids) => {
            expect(ids).toEqual([
                "1111555", "111111111",
                "1111666", "222221111",
                "3333555", "111113333",
                "3333666", "222223333",
            ]);
            done();
        });
    });

    it ("merges the changes and the graph ids", function(done){
        userChangesGeneratorFn = (userId) => {
            return [
                { originator: userId + "555", target: "11111" + userId },
                { originator: userId + "666", target: "22222" + userId }
            ];
        }
        idGeneratorGraphFn = (graphId) => {
            return [
                "44" + graphId,
                "88" + graphId
            ];
        };

        service.getAllIdsFor([
            {id: "1111"},
            {id: "3333"}
        ]).then((ids) => {
            expect(ids.sort()).toEqual([
                "441111", "881111",
                "443333", "883333",
                "1111555", "111111111",
                "1111666", "222221111",
                "3333555", "111113333",
                "3333666", "222223333",
            ].sort());
            done();
        });
    });

    it ("only returns unique ids", function(done){
        userChangesGeneratorFn = (userId) => {
            return [
                { originator: userId, target: "11111" + userId },
                { originator: userId, target: "11111" + userId },
                { originator: userId, target: "22222" + userId }
            ];
        }
        idGeneratorGraphFn = (graphId) => {
            return [
                "11111" + graphId,
                "88" + graphId,
                "5555"
            ];
        };

        service.getAllIdsFor([
            {id: "1111"},
            {id: "3333"}
        ]).then((ids) => {
            expect(ids.sort()).toEqual([
                "1111",
                "111111111",
                "222221111",
                "881111",
                "5555",
                "3333",
                "111113333",
                "222223333",
                "883333",
            ].sort());
            done();
        });
    });
});