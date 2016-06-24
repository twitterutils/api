var promise = require("the-promise-factory");
var isoDateStr = require("iso-date-str");

module.exports = function(db, dateSvc){
    if (!db) throw new Error("A database is required");
    if (!dateSvc) dateSvc = isoDateStr;

    var MODEL_VERSION = 1.1;

    return {
        create: function(authRequest){
            return getPromise("insert", setStandardFields(authRequest));
        },
        first: function(authRequestId){
            return getPromise("findOne", {_id: authRequestId});
        },
        delete: function(authRequestId){
            return getPromise("deleteOne", {_id: authRequestId});
        }
    };

    function setStandardFields(request){
        request.version = MODEL_VERSION;
        request.creation_time_str = dateSvc();
        return request;
    }

    function getCollection(){
        return db.collection("login_auth_requests");
    }

    function getPromise(fnName, firstArg){
        return promise.create((fulfill, reject) => {
            getCollection()[fnName](firstArg, (err, result) => {
                if (err) {
                    reject(err);
                }
                else{
                    fulfill(result);
                }
            });
        });
    }
};