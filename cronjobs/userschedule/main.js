var rfr = require("rfr");
rfr("userschedule/service")
    .run()
    .then(() => {
        process.exit(0);
    }, (err) => {
        process.exit(1);
    });
