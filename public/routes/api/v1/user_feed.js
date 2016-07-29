var rfr = require("rfr");
var router = require("express").Router();
var cors = require('cors');
var cache = rfr("lib/theApiCache");

router.get("/:user_name", cors(), cache.longLived(), (req, res, next) => {
    res.send({items: [
        "item1",
        "item2"
    ]});
});

module.exports = router;
