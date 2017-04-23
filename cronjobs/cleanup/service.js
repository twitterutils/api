var rfr = require("rfr");
var promise = require("the-promise-factory");

module.exports = {
    run: function () {
        return promise.create((fulfill, reject) => {
            console.log("[CLEANUP] DbCleanup Started");
            //TODO: do something here
            console.log("[CLEANUP] DbCleanup Completed");
            fulfill()
        })
    }
}
