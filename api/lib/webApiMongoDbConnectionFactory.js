var promise = require("the-promise-factory");
var rfr = require("rfr");
var webError = rfr("lib/webApiError");
var MongoClient = require("mongodb").MongoClient;

module.exports = function(res, envSettingName){
    var DEFAULT_CONNECTION_STRING_NAME = "CONNECTION_STRING";

    if (!envSettingName){
        envSettingName = DEFAULT_CONNECTION_STRING_NAME;
    }

    return promise.create((fulfill, reject) => {
        var dbConnection = process.env[envSettingName];

        if ((dbConnection || "").length == 0){
            dbConnection = process.env[DEFAULT_CONNECTION_STRING_NAME];
        }

        if ((dbConnection || "").length == 0){
            console.error("Empty connection string");
        }

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

