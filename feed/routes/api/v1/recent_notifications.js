var router = require("express").Router();

router.get("/:twitter_user_id/:max_result_count?", (req, res, next) => {
    console.log(
        "recent notifications",
        "twitter_user_id", req.params.twitter_user_id,
        "max_result_count", req.params.max_result_count || 100);

    res.send([
        {id: 1, type: "unfollow"},
        {id: 2, type: "follow"},
        {id: 3, type: "unfollow"}
    ]);
});

module.exports = router;
