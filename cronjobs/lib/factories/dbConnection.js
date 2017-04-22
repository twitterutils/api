var promise = require("the-promise-factory");
var MongoClient = require("mongodb").MongoClient;

module.exports = function(envSettingName){
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
            if (err) return reject(err);

            fulfill(db);
        });
    });
};
