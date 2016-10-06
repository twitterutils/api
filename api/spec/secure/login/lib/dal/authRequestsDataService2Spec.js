var rfr = require("rfr");
var authRequestsDataService = rfr("secure/login/lib/dal/authRequestsDataService2");

describe("authRequestsDataService", function(){
    it("requires a database", function(){
        expect(function(){
            authRequestsDataService();
        }).toThrow(new Error("A database is required"));
    });

    var collection = null;
    var dbRequests = null;
    var db = null;
    var seededError = null;
    var seededResult = null;

    beforeEach(function(){
        collection = null;
        seededError = null;
        seededResult = null;
        dbRequests = [];

        db = {
            collection: function(tableName){
                if (tableName === "login_auth_requests"){
                    return collection;
                }
            }
        };
    });

    describe("create", function(){
        var targetAuthRequest = {
            _id: "uniqueId",
            oauth_token: "my token",
            oauth_token_secret: "my secret",
            api_callback: "my callback"
        };

        beforeEach(function(){
            collection = {
                insert: function(req, callback){
                    dbRequests.push(req);
                    callback(seededError, seededResult);
                }
            };
        });

        it("creates a request with the specified id", function(done){
            seededResult = "seeded result";

            authRequestsDataService(db, () => { return "right now"; })
                .create(targetAuthRequest)
                .then((result) => {
                    expect(dbRequests).toEqual([{
                        _id: "uniqueId",
                        version: 1.1,
                        oauth_token: "my token",
                        oauth_token_secret: "my secret",
                        api_callback: "my callback",
                        creation_time_str: "right now"
                    }]);
                    expect(result).toBe("seeded result");
                    done();
                });
        });

        it("calls the correct action when insertion fails", function(done){
            seededError = "seeded error";

            authRequestsDataService(db, () => { return "right now"; })
                .create(targetAuthRequest)
                .then(() => {}, (err) => {
                    expect(dbRequests).toEqual([{
                        _id: "uniqueId",
                        version: 1.1,
                        oauth_token: "my token",
                        oauth_token_secret: "my secret",
                        api_callback: "my callback",
                        creation_time_str: "right now"
                    }]);
                    expect(err).toBe("seeded error");
                    done();
                });
        });
    });

    describe("first", function(){
        beforeEach(function(){
            collection = {
                findOne: function(req, callback){
                    dbRequests.push(req);
                    callback(seededError, seededResult);
                }
            };
        });

        it("finds request with the specified id", function(done){
            seededResult = "seeded result";

            authRequestsDataService(db)
                .first("my id")
                .then((result) => {
                    expect(dbRequests).toEqual([{ _id: "my id" }]);
                    expect(result).toBe("seeded result");
                    done();
                });
        });

        it("calls the correct action when search fails", function(done){
            seededError = "seeded error";

            authRequestsDataService(db)
                .first("my id")
                .then(() => {}, (err) => {
                    expect(dbRequests).toEqual([{ _id: "my id" }]);
                    expect(err).toBe("seeded error");
                    done();
                });
        });
    });

    describe("delete", function(){
        beforeEach(function(){
            collection = {
                deleteOne: function(req, callback){
                    dbRequests.push(req);
                    callback(seededError, seededResult);
                }
            };
        });

        it("finds request with the specified id", function(done){
            seededResult = "seeded result";

            authRequestsDataService(db)
                .delete("my id")
                .then((result) => {
                    expect(dbRequests).toEqual([{ _id: "my id" }]);
                    expect(result).toBe("seeded result");
                    done();
                });
        });

        it("calls the correct action when search fails", function(done){
            seededError = "seeded error";

            authRequestsDataService(db)
                .delete("my id")
                .then(() => {}, (err) => {
                    expect(dbRequests).toEqual([{ _id: "my id" }]);
                    expect(err).toBe("seeded error");
                    done();
                });
        });
    });
});