var promise = require("the-promise-factory");
var rfr = require("rfr");
var singleUserProcessor = rfr("autounfollow/lib/services/singleUserProcessor");

describe("singleUserProcessor", function() {
    var userCredentialsDataServiceStub = null;
    var seededUserCredentialsResult = null;
    var seededUserCredentialsError = null;

    var userChangesServiceStub = null;
    var seededUserChangesServiceResult = null;
    var seededUserChangesServiceError = null;

    var unfollowActionsBuilderStub = null;
    var seededUnfollowActionsResult = null;
    var seededUnfollowActionsError = null;

    var twitterFollowersServiceStub = null;
    var unfollowInvocations = null;
    var seededUnfollowError = null;

    var notificationsDataServiceStub = null;
    var sendNotificationInvocations = null;
    var seededSendNotificationError = null;

    var processor = null;

    beforeEach(function(){
        seededUserCredentialsResult = null;
        seededUserCredentialsError = null;
        userCredentialsDataServiceStub = {
            first: (userId) => {
                return promise.create((fulfill, reject) => {
                    if (seededUserCredentialsResult) return fulfill(seededUserCredentialsResult);
                    if (seededUserCredentialsError) return reject(seededUserCredentialsError);

                    throw new Error("Invalid UserCredentials Invocation");
                });
            }
        };
        spyOn(userCredentialsDataServiceStub, "first").and.callThrough();


        seededUserChangesServiceResult = null;
        seededUserChangesServiceError = null;
        userChangesServiceStub = {
            read: (user) => {
                return promise.create((fulfill, reject) => {
                    if (seededUserChangesServiceResult) return fulfill(seededUserChangesServiceResult);
                    if (seededUserChangesServiceError) return reject(seededUserChangesServiceError);

                    throw new Error("Invalid UserChanges Invocation");
                });
            }
        }
        spyOn(userChangesServiceStub, "read").and.callThrough();


        seededUnfollowActionsResult = null;
        seededUnfollowActionsError = null;
        unfollowActionsBuilderStub = {
            build: (changes, userDetails) => {
                return promise.create((fulfill, reject) => {
                    if (seededUnfollowActionsResult) return fulfill(seededUnfollowActionsResult);
                    if (seededUnfollowActionsError) return reject(seededUnfollowActionsError);

                    throw new Error("Invalid UnfollowActionsBuilder Invocation");
                });
            }
        };
        spyOn(unfollowActionsBuilderStub, "build").and.callThrough();


        unfollowInvocations = [];
        seededUnfollowError = null
        twitterFollowersServiceStub = {
            unfollow: (credentials, userId) => {
                return promise.create((fulfill, reject) => {
                    if (seededUnfollowError) return reject(seededUnfollowError);

                    unfollowInvocations.push({
                        credentials: credentials,
                        userId: userId
                    });

                    fulfill({result: "ok"});
                });
            }
        };


        sendNotificationInvocations = [];
        seededSendNotificationError = null;
        notificationsDataServiceStub = {
            send: (notificationType, userId, details) => {
                return promise.create((fulfill, reject) => {
                    if (seededSendNotificationError) return reject(seededSendNotificationError);

                    sendNotificationInvocations.push({
                        type: notificationType,
                        userId: userId,
                        details: details
                    });

                    fulfill({success: true});
                });
            }
        };

        processor = singleUserProcessor(
            userCredentialsDataServiceStub,
            userChangesServiceStub,
            unfollowActionsBuilderStub,
            twitterFollowersServiceStub,
            notificationsDataServiceStub
        );

        spyOn(console, "log");
    });

    it("reads the user credentials", function(done){
        seededUserCredentialsResult = {name: "some credentials"};
        seededUserChangesServiceResult = {
            userDetails: {name: "user details"},
            changes: ["change 1", "change 2"]
        };
        seededUnfollowActionsResult = ["111111", "222222"];

        processor.process({id: "123456"})
            .then(() => {
                expect(userCredentialsDataServiceStub.first).toHaveBeenCalledWith("123456");
                done();
            });
    });

    it("fails when credentials could not be read", function(done){
        seededUserCredentialsError = "something went wrong reading the credentials";

        processor.process({id: "123456"})
            .then(null, (err) => {
                expect(err).toEqual("something went wrong reading the credentials");
                done();
            });
    });

    it("reads the user changes", function(done){
        seededUserCredentialsResult = {name: "some credentials"};
        seededUserChangesServiceResult = {
            userDetails: {name: "user details"},
            changes: ["change 1", "change 2"]
        };
        seededUnfollowActionsResult = ["111111", "222222"];

        processor.process({id: "123456"})
            .then(() => {
                expect(userChangesServiceStub.read).toHaveBeenCalledWith({id: "123456"});
                done();
            });
    });

    it("fails when user changes could not be read", function(done){
        seededUserCredentialsResult = {name: "some credentials"};
        seededUserChangesServiceError = "something went wrong reading the user changes";

         processor.process({id: "123456"})
            .then(null, (err) => {
                expect(err).toEqual("something went wrong reading the user changes");
                done();
            });
    });

    it("builds the unfollow actions", function(done) {
        seededUserCredentialsResult = {name: "some credentials"};
        seededUserChangesServiceResult = {
            userDetails: {name: "user details"},
            changes: ["change 1", "change 2"]
        };
        seededUnfollowActionsResult = ["111111", "222222"];

        processor.process({id: "123456"})
            .then(() => {
                expect(unfollowActionsBuilderStub.build).toHaveBeenCalledWith(
                    ["change 1", "change 2"],
                    {name: "user details"}
                );
                done();
            });
    });

    it("fails when unfollow actions could not be built", function(done){
        seededUserCredentialsResult = {name: "some credentials"};
        seededUserChangesServiceResult = {
            userDetails: {name: "user details"},
            changes: ["change 1", "change 2"]
        };
        seededUnfollowActionsError = "something went wrong building the unfollow actions";

        processor.process({id: "123456"})
            .then(null, (err) => {
                expect(err).toEqual("something went wrong building the unfollow actions");
                done();
            });
    });

    it("executes each unfollow action", function(done){
        seededUserCredentialsResult = {name: "some credentials"};
        seededUserChangesServiceResult = {
            userDetails: {name: "user details"},
            changes: ["change 1", "change 2"]
        };
        seededUnfollowActionsResult = ["111111", "222222"];

        processor.process({id: "123456"})
            .then(() => {
                expect(unfollowInvocations).toEqual([
                    {
                        credentials: {name: "some credentials"},
                        userId: "111111"
                    },
                    {
                        credentials: {name: "some credentials"},
                        userId: "222222"
                    },
                ]);
                done();
            });
    });

    it("sends a notificaiton foreach unfollow action", function(done){
        seededUserCredentialsResult = {id: "123456", name: "some credentials"};
        seededUserChangesServiceResult = {
            userDetails: {name: "user details"},
            changes: ["change 1", "change 2"]
        };
        seededUnfollowActionsResult = ["111111", "222222"];

        processor.process({id: "123456"})
            .then(() => {
                expect(sendNotificationInvocations).toEqual([
                    {
                        type: "unfollow",
                        userId: "123456",
                        details: {
                            target: "111111"
                        }
                    },
                    {
                        type: "unfollow",
                        userId: "123456",
                        details: {
                            target: "222222"
                        }
                    },
                ]);
                done();
            });
    });

    it("fails when unfollow fails", function(done){
        seededUserCredentialsResult = {id: "123456", name: "some credentials"};
        seededUserChangesServiceResult = {
            userDetails: {name: "user details"},
            changes: ["change 1", "change 2"]
        };
        seededUnfollowActionsResult = ["111111", "222222"];
        seededUnfollowError = "cannot unfollow";

        processor.process({id: "123456"})
            .then(null, (err) => {
                expect(err).toEqual("cannot unfollow");
                done();
            });
    });

    it("fails when send notifications fails", function(done){
        seededUserCredentialsResult = {id: "123456", name: "some credentials"};
        seededUserChangesServiceResult = {
            userDetails: {name: "user details"},
            changes: ["change 1", "change 2"]
        };
        seededUnfollowActionsResult = ["111111", "222222"];
        seededSendNotificationError = "cannot send notification";

        processor.process({id: "123456"})
            .then(null, (err) => {
                expect(err).toEqual("cannot send notification");
                done();
            });
    });
});