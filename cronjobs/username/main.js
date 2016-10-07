var rfr = require("rfr");
rfr("username/service")
    .run()
    .then(() => {
        process.exit(0);
    }, (err) => {
        process.exit(1);
    });
