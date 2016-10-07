var promise = require("the-promise-factory");

module.exports = function() {
    return {
        build: function(userChanges, userDetails){
            return promise.create((fulfill, reject) => {
                var result = userChanges
                    .filter((change) => {
                        return change.type === "unfollow";
                    })
                    .filter((change) => {
                        return userDetails.friends.find((userId) => {
                            return userId == change.originator;
                        });
                    })
                    .map((change) => {
                        return change.originator;
                    });

                fulfill(result);
            });
        }
    };
}