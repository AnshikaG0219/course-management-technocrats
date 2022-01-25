const User = require("../models/user");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.loginGET = (req, res) => {
  res.render("login");
};
exports.loginPOST = (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        if (req.user.role === "teacher")
          res.redirect("/teacher/" + req.user._id);
        else if (req.user.role === "student")
          res.redirect("/student/" + req.user._id);
        else if (req.user.role === "admin") res.send("ADMIN");
      });
    }
  });
};
exports.logout = (req, res) => {
  req.logout();
  res.redirect("/login");
};
