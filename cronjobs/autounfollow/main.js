require("global-console-prefix")("[AUTOUNFOLLOW]");

var rfr = require("rfr");
rfr("autounfollow/service")
    .run()
    .then(() => {
        process.exit(0);
    }, (err) => {
        process.exit(1);
    });
