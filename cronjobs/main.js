require("global-console-prefix")("[TWITTERUTILS]");

console.log("CronGlobalStart")

var rfr = require("rfr");
var globalConsolePrefix = require("global-console-prefix");
var async = require("async");

(function () {
    async.series([
        runService(rfr("userschedule/service")),
        runService(rfr("usergraph/service")),
        runService(rfr("username/service")),

        runService(rfr("autounfollow/service")),

        runService(rfr("feedbuilder/service")),
        runService(rfr("cleanup/service"))
    ], handleResults);

    function runService(service, consolePrefix){
        return (callback) => {
            service
                .run()
                .then(() => {
                    callback(null);
                }, callback);
        }
    }

    function handleResults(err, results) {
        if (err) {
            console.error(err, err.stack)
            console.log("CronGlobalError")
            process.exit(1);
        }
        else{
            console.log("CronGlobalEnd")
            process.exit(0);
        }
    }
})();
