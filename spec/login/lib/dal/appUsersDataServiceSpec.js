var rfr = require("rfr");
var promise = require("the-promise-factory");
var appUsersDataService = rfr("login/lib/dal/appUsersDataService");

describe("appUsersDataService", function(){
    it("requires a database", function(){
        expect(function(){
            appUsersDataService();
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
                if (tableName === "login_app_users"){
                    return collection;
                }
            }
        };
    });

    describe("create", function(){
        var targetUser = {
            twitter_user_id: "unique id",
            twitter_screen_name: "at lolo",
            oauth_access_token: "secret value",
            oauth_access_token_secret: "super secret value"
        };
        var currentDateSvc = null;

        beforeEach(function(){
            collection = {
                insert: function(req, callback){
                    dbRequests.push(req);
                    callback(seededError, seededResult);
                }
            };

            var invocation = 0;
            currentDateSvc = () => {
                invocation++;
                return `now${invocation}`
            };
        });

        it("creates a request with the specified id", function(done){
            seededResult = "seeded result";

            appUsersDataService(db, currentDateSvc)
                .create(targetUser)
                .then((result) => {
                    expect(dbRequests).toEqual([{
                        version: 1.0,
                        twitter_user_id: "unique id",
                        twitter_screen_name: "at lolo",
                        oauth_access_token: "secret value",
                        oauth_access_token_secret: "super secret value",
                        creation_time_str: "now1",
                        modified_time_str: "now2"
                    }]);
                    expect(result).toBe("seeded result");
                    done();
                });
        });

        it("calls the correct action when insertion fails", function(done){
            seededError = "seeded error";

            appUsersDataService(db, currentDateSvc)
                .create(targetUser)
                .then(() => {}, (err) => {
                    expect(dbRequests).toEqual([{
                        version: 1.0,
                        twitter_user_id: "unique id",
                        twitter_screen_name: "at lolo",
                        oauth_access_token: "secret value",
                        oauth_access_token_secret: "super secret value",
                        creation_time_str: "now1",
                        modified_time_str: "now2"
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

            appUsersDataService(db)
                .first("my id")
                .then((result) => {
                    expect(dbRequests).toEqual([{ twitter_user_id: "my id" }]);
                    expect(result).toBe("seeded result");
                    done();
                });
        });

        it("calls the correct action when search fails", function(done){
            seededError = "seeded error";

            appUsersDataService(db)
                .first("my id")
                .then(() => {}, (err) => {
                    expect(dbRequests).toEqual([{ twitter_user_id: "my id" }]);
                    expect(err).toBe("seeded error");
                    done();
                });
        });
    });

    describe("all", function(){
        beforeEach(function(){
            collection = {
                find: function(){
                    return {
                        toArray: function(){
                            return promise.create((fulfill, reject) => {
                                if (seededError){
                                    reject(seededError);
                                    return;
                                }
                                
                                if (seededResult){
                                    fulfill(seededResult);
                                    return;
                                }

                                return jasmine.getEnv().fail("Invalid seeding");
                            });
                        }
                    };
                }
            };
        });

        it("finds request with the specified id", function(done){
            seededResult = [
                {twitter_user_id: "id1", twitter_screen_name: "name1", dont_care: "lalala"},
                {twitter_user_id: "id2", twitter_screen_name: "name2", dont_care: "lalala"}
            ];

            appUsersDataService(db)
                .all()
                .then((result) => {
                    expect(result).toEqual([
                        {id: "id1", user_name: "name1"},
                        {id: "id2", user_name: "name2"}
                    ]);
                    done();
                });
        });

        it("calls the correct action when search fails", function(done){
            seededError = "seeded error";

            appUsersDataService(db)
                .all()
                .then(() => {}, (err) => {
                    expect(err).toBe("seeded error");
                    done();
                });
        });
    });

    describe("updateCredentials", function(){
        var updateRequests = null;
        var credentials = {oauth_access_token: "token", oauth_access_token_secret: "secret"};

        beforeEach(function(){
            updateRequests = [];
            collection = {
                updateOne: function(req, updateReq, callback){
                    dbRequests.push(req);
                    updateRequests.push(updateReq);
                    callback(seededError, seededResult);
                }
            };
        });

        it("finds request with the specified id", function(done){
            seededResult = "seeded result";

            appUsersDataService(db, () => { return "right now"; })
                .updateCredentials("my id", credentials)
                .then((result) => {
                    expect(dbRequests).toEqual([{ twitter_user_id: "my id" }]);
                    expect(updateRequests).toEqual([
                        {
                            $set: { 
                                oauth_access_token: "token",
                                oauth_access_token_secret: "secret",
                                modified_time_str: "right now"
                            }
                        }
                    ]);
                    expect(result).toBe("seeded result");
                    done();
                });
        });

        it("calls the correct action when search fails", function(done){
            seededError = "seeded error";

            appUsersDataService(db, () => { return "right now"; })
                .updateCredentials("my id", credentials)
                .then(() => {}, (err) => {
                    expect(dbRequests).toEqual([{ twitter_user_id: "my id" }]);
                    expect(updateRequests).toEqual([
                        {
                            $set: { 
                                oauth_access_token: "token",
                                oauth_access_token_secret: "secret",
                                modified_time_str: "right now"
                            }
                        }
                    ]);
                    expect(err).toBe("seeded error");
                    done();
                });
        });
    });
});
