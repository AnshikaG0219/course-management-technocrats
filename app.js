require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const CustomStrategy = require("passport-custom")
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
});
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  res.render("home");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/register", function (req, res) {
  res.render("register");
});
app.get("/student/:stud_id", function (req, res) {
  const stud_id = req.params.stud_id;
  if (req.isAuthenticated()) {
    res.render("student/student-dash", {user: req.user});
  } else {
    res.redirect("/login");
  }
});
app.get("/teacher/:teach_id", function (req, res) {
  const teach_id = req.params.teach_id;
  if (req.isAuthenticated()) {
    res.render("teacher/teacher-dash", {user: req.user});
  } else {
    res.redirect("/login");
  }
});
app.get("/profile/:id", function(req, res){
  if(req.isAuthenticated())
  {
    res.render("profile", {user: req.user})
  }
  else
  res.redirect("/login");
})
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/login");
});
app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        if(req.user.role === "teacher")
        res.redirect("/teacher/"+req.user._id);
        else if(req.user.role === "student")
        res.redirect("/student/"+req.user._id);
        else if(req.user.role === "admin")
        res.send("ADMIN")
      });
    }
  }); 
});
app.post("/register", function (req, res) {
  User.register(
    { name: req.body.name, username: req.body.username, role: req.body.role },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          if (user.role === "teacher") res.redirect("/teacher/"+req.user._id);
          else if (user.role === "student") res.redirect("/student/"+req.user._id);
          else if(user.role === "admin") res.send("ADMIN")
          else {
            console.log("Wrong role");
            res.send("wrong role")
          }
        });
      }
    }
  );
});
app.listen(3000, function () {
  console.log("Server started at port 3000");
});
