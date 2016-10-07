require("global-console-prefix")("[USERFEEDBUILDER]");

var rfr = require("rfr");
rfr("feedbuilder/service")
    .run()
    .then(() => {
        process.exit(0);
    }, (err) => {
        process.exit(1);
    });
