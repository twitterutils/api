var router = require("express").Router();

router.get("/:twitter_user_id/", (req, res, next) => {
    res.send([
        {id: 1, type: "unfollow"},
        {id: 2, type: "follow"},
        {id: 3, type: "unfollow"}
    ]);
});

module.exports = router;
