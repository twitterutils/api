var promise = require("the-promise-factory");
var rfr = require("rfr");
var dbConnectionFactory = rfr("lib/factories/dbConnection");

module.exports = function (dbConnectionFn) {
    if (!dbConnectionFn){
        dbConnectionFn = dbConnectionFactory;
    }

    return {
        create: function(connString, createServiceCallback){
            return promise.create((fulfill, reject) => {
                dbConnectionFn(connString)
                    .then((db) => {
                        var result = createServiceCallback(db);
                        fulfill(result);
                    }, reject);
            });
        }
    };
}