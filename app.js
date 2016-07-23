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


app.use("/login/api/v1/status", rfr("login/routes/api/v1/status"));
app.use("/login/api/v1/users", rfr("login/routes/api/v1/users"));
app.use("/login/api/v1/user", rfr("login/routes/api/v1/user_details"));
app.use("/login/api/v1/login", rfr("login/routes/api/v1/login"));
app.use("/login/api/v1/auth/twitter_callback/", rfr("login/routes/api/v1/auth/twitter_callback"));


app.use("/graph/api/v1/status", rfr("graph/routes/api/v1/status"));
app.use("/graph/api/v1/graph", rfr("graph/routes/api/v1/graph_details"));
app.use("/graph/api/v1/user", rfr("graph/routes/api/v1/user_details"));
app.use("/graph/api/v1/changes", rfr("graph/routes/api/v1/user_changes_list"));
app.use("/graph/api/v1/recentchanges", rfr("graph/routes/api/v1/recent_changes_list"));


app.use("/notifications/api/v1/status", rfr("notifications/routes/api/v1/status"));
app.use("/notifications/api/v1/send", rfr("notifications/routes/api/v1/send_notification"));


app.use("/feed/api/v1/status", rfr("notifications/routes/api/v1/status"));
app.use("/feed/api/v1/recentnotifications", rfr("feed/routes/api/v1/recent_notifications"));


app.use("/usernames/api/v1/status", rfr("usernames/routes/api/v1/status"));
app.use("/usernames/api/v1/find", rfr("usernames/routes/api/v1/usernames_list"));


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
