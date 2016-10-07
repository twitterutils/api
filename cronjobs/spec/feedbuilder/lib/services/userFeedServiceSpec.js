var rfr = require("rfr");
var userIdHelper = rfr("feedbuilder/lib/helpers/userIdHelper");
var userFeedService = rfr("feedbuilder/lib/services/userFeedService");

describe("userFeedService", function(){
    var service = null;

    var recentNotificationsReadUserIds = null;
    var recentNotificationsSeededResult = null;
    var recentNotificationsSeededError = null;

    var findReadIds = null;
    var findSeededError = null;
    var findSeededResult = null;
    var usernamesDataServiceStub = null;

    var transformReadUsernames = null;
    var transformReadNotifications = null;
    var transformSeededResult = null;

    var saveReadUser = null;
    var saveReadNotifications = null;
    var saveSeededError = null;

    beforeEach(function(){
        recentNotificationsReadUserIds = [];
        recentNotificationsSeededResult = [];
        recentNotificationsSeededError = null;
        var notificationsDataServiceStub = {
            recentNotifications: (userId) => {
                recentNotificationsReadUserIds.push(userId);

                return {
                    then: (fulfill, reject) => {
                        if (recentNotificationsSeededError){
                            reject(recentNotificationsSeededError);
                            return;
                        }

                        fulfill(recentNotificationsSeededResult);
                    }
                }
            }
        }

        findReadIds = [];
        findSeededError = null;
        findSeededResult = [];
        usernamesDataServiceStub = {
            find: (ids) => {
                ids.forEach((id) => {
                    findReadIds.push(id);
                })

                return {
                    then: (fulfill, reject) => {
                        if (findSeededError){
                            reject(findSeededError);
                            return;
                        }

                        fulfill(findSeededResult);
                    }
                }
            }
        }

        transformReadUsernames = null;
        transformReadNotifications = null;
        transformSeededResult = [];
        var notificationsTransformerStub = {
            transform: (usernames, notifications) => {
                transformReadUsernames = usernames;
                transformReadNotifications = notifications;
                return transformSeededResult;
            }
        };

        saveReadUser = null;
        saveReadNotifications = null;
        saveSeededError = null;
        var feedDataServiceStub = {
            save: (user, notifications) => {
                saveReadUser = user;
                saveReadNotifications = notifications;
                return {
                    then: (fulfill, reject) => {
                        if (saveSeededError){
                            reject(saveSeededError);
                            return;
                        }

                        fulfill();
                    }
                }
            }
        }

        service = userFeedService(
            notificationsDataServiceStub,
            usernamesDataServiceStub,
            userIdHelper(),
            notificationsTransformerStub,
            feedDataServiceStub
        );

        spyOn(console, "log");
    });

    it("reads the user notifications", function(done){
        service.save({id: "55555", userName: "lolo"}).then(() => {
            expect(recentNotificationsReadUserIds).toEqual(["55555"]);
            done();
        });
    });

    it("fails when notifications could not be read", function(done){
        recentNotificationsSeededError = "error reading notifications";

        service.save({id: "55555", userName: "lolo"}).then(null, (err) => {
            expect(err).toBe("error reading notifications");
            done();
        });
    });

    it("reads the usernames", function(done){
        recentNotificationsSeededResult = [
            {userId: "11111"},
            {userId: "55555"},
            {userId: "77777"}
        ];

        service.save({id: "2222", userName: "lolo"}).then(() => {
            expect(findReadIds).toEqual(["11111", "55555", "77777"]);
            done();
        })
    });

    it("does not read the usernames if there were no notifications", function(done){
        spyOn(usernamesDataServiceStub, "find").and.callThrough();

        service.save({id: "55555", userName: "lolo"}).then(() => {
            expect(usernamesDataServiceStub.find).not.toHaveBeenCalled();
            done();
        });
    });

    it("fails when usernames could not be read", function(done){
        recentNotificationsSeededResult = [
            {userId: "11111"}
        ];
        findSeededError = "could not read usernames";

        service.save({id: "55555", userName: "lolo"}).then(null, (err) => {
            expect(err).toBe("could not read usernames");
            done();
        });
    });

    it ("transforms the notifications", function(done){
        recentNotificationsSeededResult = [
            {userId: "11111"},
            {userId: "55555"}
        ];
        findSeededResult = [
            {userId: "11111", userName: "lolo"},
            {userId: "55555", userName: "pepe"}
        ];

        service.save({id: "2222", userName: "lolo"}).then(() => {
            expect(transformReadNotifications).toEqual([
                {userId: "11111"},
                {userId: "55555"}
            ]);

            expect(transformReadUsernames).toEqual([
                {userId: "11111", userName: "lolo"},
                {userId: "55555", userName: "pepe"}
            ]);
            done();
        })
    });

    it ("saves the transformed notifications", function(done){
        transformSeededResult = ["notif 1", "notif 2"];

        service.save({id: "2222", userName: "lolo"}).then(() => {
            expect(saveReadUser).toEqual({id: "2222", userName: "lolo"});
            expect(saveReadNotifications).toEqual(["notif 1", "notif 2"]);
            done();
        });
    });

    it("fails when notifications could not be saved", function(done){
        saveSeededError = "error saving notifications";

        service.save({id: "55555", userName: "lolo"}).then(null, (err) => {
            expect(err).toBe("error saving notifications");
            done();
        });
    });
});