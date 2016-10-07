var async = require("async");
var promise = require("the-promise-factory");

module.exports = function(
    userChangesServiceFactory,
    registeredUsersDataService,
    userScheduleDataService,
    changesBroadcastServiceFactory){
    return {
        run: function(){
            return promise.create((fulfill, reject) => {
                async.waterfall([
                    getInitialDependencies,
                    sanitizeInput,
                    filterUsersOutsideOfTheSchedule,
                    crawlUsers
                ], (err, results) => {
                    if (err) return reject(err);
                    fulfill();
                });

                function getInitialDependencies(callback){
                    async.parallel({
                        allUsers: readAllRegisteredUsers,
                        scheduledUserIds: readScheduledUserIds,
                        userChangesService: createUserChangesService,
                        changesBroadcastService: createChangesBroadcastService
                    }, callback);
                }

                function sanitizeInput(input, callback){
                    input.users = [];
                    input.allUsers = input.allUsers || [];
                    input.scheduledUserIds = input.scheduledUserIds || [];

                    callback(null, input);
                }

                function filterUsersOutsideOfTheSchedule(input, callback){
                    input.users = input.allUsers.filter((u) => {
                        return input.scheduledUserIds.indexOf(u.id) >= 0;
                    });

                    callback(null, input);
                }

                function crawlUsers(input, callback){
                    console.log("crawler.crawlUsers", "usersLength=", (input.users || []).length);
                    async.each(
                        input.users,
                        processSingleUser(input.userChangesService, input.changesBroadcastService),
                        callback);
                }

                function processSingleUser(userChangesService, changesBroadcastService){
                    return (user, callback) => {
                        async.waterfall([
                            retrieveChanges(userChangesService, user),
                            broadcastChanges(changesBroadcastService)
                        ], callback);
                    };
                }

                function retrieveChanges(userChangesService, user){
                    return (callback) => {
                        userChangesService
                            .changesFor(user)
                            .then((changes) => {
                                callback(null, changes);
                            }, callback);
                    };
                }

                function broadcastChanges(changesBroadcastService){
                    return (changes, callback) => {
                        changesBroadcastService
                            .broadcast(changes)
                            .then(() => {
                                callback(null)
                            }, callback);
                    };
                }

                function readAllRegisteredUsers(callback){
                    handlePromise(registeredUsersDataService.all(), callback);
                }

                function readScheduledUserIds(callback){
                    handlePromise(userScheduleDataService.read(), callback);
                }

                function createUserChangesService(callback){
                    handlePromise(userChangesServiceFactory.create(), callback);
                }

                function createChangesBroadcastService(callback){
                    handlePromise(changesBroadcastServiceFactory.create(), callback);
                }

                function handlePromise(promiseValue, callback){
                    promiseValue.then((result) => {
                        callback(null, result);
                    }, callback);
                }
            });
        }
    };
}