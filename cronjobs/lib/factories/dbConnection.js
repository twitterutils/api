var promise = require("the-promise-factory");
var MongoClient = require("mongodb").MongoClient;

module.exports = function(envSettingName){
    if (!envSettingName){
        envSettingName = "CONNECTION_STRING";
    }

    return promise.create((fulfill, reject) => {
        var dbConnection = process.env[envSettingName];
        MongoClient.connect(dbConnection, function(err, db){
            if (err) return reject(err);

            fulfill(db);
        });
    });
};
