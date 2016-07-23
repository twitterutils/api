var rfr = require("rfr");
var router = require("express").Router();

router.get("/:userIds/", (req, res, next) => {
    res.send(req.params.userIds);
});

module.exports = router;