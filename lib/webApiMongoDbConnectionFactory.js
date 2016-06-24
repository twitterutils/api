var promise = require("the-promise-factory");
var rfr = require("rfr");
var webError = rfr("lib/webApiError");
var MongoClient = require("mongodb").MongoClient;

module.exports = function(res, envSettingName){
    if (!envSettingName){
        envSettingName = "CONNECTION_STRING";
    }

    return promise.create((fulfill, reject) => {
        var dbConnection = process.env[envSettingName];
        MongoClient.connect(dbConnection, function(err, db){
            if (err){
                webError.unexpected(res, "Db Connection Failure", err);
                reject(err);
                return;
            }

            fulfill(db);
        });
    });
};

