var promise = require("the-promise-factory");
var isoDateStr = require("iso-date-str");

module.exports = function(db, dateSvc) {
    if (!db) throw new Error("A database is required");
    if (!dateSvc) dateSvc = isoDateStr;

    return {
        update: function(userId, scheduleInfo){
            return promise.create((fulfill, reject) => {
                reject("something went wrong");
            });
        }
    }
}