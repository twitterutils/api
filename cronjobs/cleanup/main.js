require("global-console-prefix")("[CLEANUP]");

var rfr = require("rfr");
rfr("cleanup/service")
    .run()
    .then(() => {
        process.exit(0);
    }, (err) => {
        process.exit(1);
    });
