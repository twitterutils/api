var rfr = require("rfr");
var express = require("express");
var path = require("path");
var logger = require("morgan");
var bodyParser = require("body-parser");


var app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));


app.use("/secure/login/api/v1/status", rfr("secure/login/routes/api/v1/status"));
app.use("/secure/login/api/v1/users", rfr("secure/login/routes/api/v1/users"));
app.use("/secure/login/api/v1/user", rfr("secure/login/routes/api/v1/user_details"));
app.use("/secure/login/api/v1/disable", rfr("secure/login/routes/api/v1/disable_user"));
app.use("/secure/login/api/v1/login", rfr("secure/login/routes/api/v1/login"));
app.use("/secure/login/api/v1/auth/twitter_callback/", rfr("secure/login/routes/api/v1/auth/twitter_callback"));


app.use("/secure/graph/api/v1/status", rfr("secure/graph/routes/api/v1/status"));
app.use("/secure/graph/api/v1/graph", rfr("secure/graph/routes/api/v1/graph_details"));
app.use("/secure/graph/api/v1/user", rfr("secure/graph/routes/api/v1/user_details"));
app.use("/secure/graph/api/v1/changes", rfr("secure/graph/routes/api/v1/user_changes_list"));
app.use("/secure/graph/api/v1/recentchanges", rfr("secure/graph/routes/api/v1/recent_changes_list"));


app.use("/secure/crawler/api/v1/status", rfr("secure/crawler/routes/api/v1/status"));
// app.use("/secure/crawler/api/v1/schedule", rfr("secure/crawler/routes/api/v1/scheduled_users_list"));
app.use("/secure/crawler/api/v1/updateuser", rfr("secure/crawler/routes/api/v1/update_user_scheduled_time"));


app.use("/secure/notifications/api/v1/status", rfr("secure/notifications/routes/api/v1/status"));
app.use("/secure/notifications/api/v1/send", rfr("secure/notifications/routes/api/v1/send_notification"));


app.use("/secure/feed/api/v1/status", rfr("secure/notifications/routes/api/v1/status"));
app.use("/secure/feed/api/v1/recentnotifications", rfr("secure/feed/routes/api/v1/recent_notifications"));


app.use("/secure/usernames/api/v1/status", rfr("secure/usernames/routes/api/v1/status"));
app.use("/secure/usernames/api/v1/find", rfr("secure/usernames/routes/api/v1/usernames_list"));


app.use("/public/api/v1/status", rfr("public/routes/api/v1/status"));
app.use("/public/api/v1/feed", rfr("public/routes/api/v1/user_feed"));


// catch 404 and forward to error handler
app.use((req, res, next) => {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get("env") === "development") {
    app.use((err, req, res, next) => {
      res.status(err.status || 500);

      res.send({
          error: err.message,
          status: err.status,
          stack: err.stack
      });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
        error: err.message
    });
});


module.exports = app;
