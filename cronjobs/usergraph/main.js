var rfr = require("rfr");
rfr("usergraph/service")
    .run()
    .then(() => {
        process.exit(0);
    }, (err) => {
        process.exit(1);
    });
