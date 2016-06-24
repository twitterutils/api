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
