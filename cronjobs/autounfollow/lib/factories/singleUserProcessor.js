module.exports = function(
    singleUserProcessorFn,

    userCredentialsDataServiceFn,
    userChangesServiceFn,
    unfollowActionsBuilderFn,
    twitterFollowersServiceFn,
    notificationsDataServiceFn,

    userStatusDataServiceFn,
    graphDataServiceFn,

    registeredUsersDataServiceFn
    ) {
    var registeredUsersDataService = registeredUsersDataServiceFn();
    var twitterFollowersService = twitterFollowersServiceFn(registeredUsersDataService);

    return {
        create: function(db){
            if (!db) throw new Error("A database is required");

            var userCredentialsDataService = userCredentialsDataServiceFn();

            var userStatusDataService = userStatusDataServiceFn(db);
            var graphDataService = graphDataServiceFn();
            var userChangesService = userChangesServiceFn(
                userStatusDataService,
                graphDataService
            );
            var unfollowActionsBuilder = unfollowActionsBuilderFn();
            var notificationsDataService = notificationsDataServiceFn();

            return singleUserProcessorFn(
                userCredentialsDataService,
                userChangesService,
                unfollowActionsBuilder,
                twitterFollowersService,
                notificationsDataService);
        }
    };
}