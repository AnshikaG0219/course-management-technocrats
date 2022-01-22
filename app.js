require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const multer = require("multer");
const CustomStrategy = require("passport-custom");
const app = express();
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/lectures/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});
let upload = multer({
  storage: storage
})

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
const courseSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String,
  image: String,
  teacher: String,
  video: String,
});
const purchaseSchema = new mongoose.Schema({
  courseTitle: String,
  courseDescription: String,
  student: String,
  courseID: String
})
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);
const Course = new mongoose.model("Course", courseSchema);
const Purchase = new mongoose.model("Purchase", purchaseSchema);

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
    res.render("student/student-dash", { user: req.user });
  } else {
    res.redirect("/login");
  }
});
app.get("/teacher/:teach_id/courses", function (req, res) {
  const teach_id = req.params.teach_id;
  if (req.isAuthenticated()) {
    Course.find({teacher: teach_id}, function(err, c){
      res.render("teacher/courses", { user: req.user, courses: c});
    })
  } else {
    res.redirect("/login");
  }
});
app.get("/buy-course", function (req, res) {
  if (req.isAuthenticated())
  {
    let teacherName = []
    Course.find({}, function(err, c){
      c.forEach(element => {
        User.find({_id: element.teacher}, function(err, teach){
          console.log(teach);
          res.render("courses", { user: req.user, courses: c});
        })
      });
      
    })
  } 
  else res.redirect("/login");
});
app.get("/teacher/:teach_id/add-course", function (req, res) {
  const teach_id = req.params.teach_id;
  if (req.isAuthenticated())
    res.render("teacher/upload-course", { user: req.user });
  else res.redirect("/login");
});
app.get("/teacher/:teach_id", function (req, res) {
  const teach_id = req.params.teach_id;
  if (req.isAuthenticated()) {
    res.render("teacher/teacher-dash", { user: req.user });
  } else {
    res.redirect("/login");
  }
});
app.get("/profile/:id", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("profile", { user: req.user });
  } else res.redirect("/login");
});
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/login");
});
app.post(
  "/teacher/:teach_id/add-course",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "lecture", maxCount: 1 },
  ]),
  function (req, res) {
    const t_id = req.params.teach_id;
    if (req.isAuthenticated()) {
      const course = new Course({
        title: req.body.title,
        price: req.body.price,
        description: req.body.desc,
        image: req.files.thumbnail[0].filename,
        teacher: req.user._id,
        video: req.files.lecture[0].filename
      });
      course.save(function (err) {
        if (!err) {
          res.redirect(`/teacher/${t_id}/courses`);
        } else {
          console.log(err);
        }
      });
    } else {
      res.redirect("/login");
    }
  }
);
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
        if (req.user.role === "teacher")
          res.redirect("/teacher/" + req.user._id);
        else if (req.user.role === "student")
          res.redirect("/student/" + req.user._id);
        else if (req.user.role === "admin") res.send("ADMIN");
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
          if (user.role === "teacher") res.redirect("/teacher/" + req.user._id);
          else if (user.role === "student")
            res.redirect("/student/" + req.user._id);
          else if (user.role === "admin") res.send("ADMIN");
          else {
            console.log("Wrong role");
            res.send("wrong role");
          }
        });
      }
    }
  );
});
app.listen(3000, function () {
  console.log("Server started at port 3000");
});
