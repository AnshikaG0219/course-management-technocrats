require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const multer = require("multer");
const app = express();
const User = require('./models/user')

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir  = './public/uploads/'+file.fieldname+'/';
    cb(null,dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});
let upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "application/pdf" ||
      file.mimetype == "video/mp4" ||
      file.mimetype == "video/mpeg"
    ) {
      cb(null, true);
    } else if (file.mimetype == "application/pdf") {
    }
  },
});

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

// userSchema.plugin(passportLocalMongoose);

// const User = new mongoose.model("User", userSchema);
// const Course = new mongoose.model("Course", courseSchema);

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
app.get("/student/:student_id/courses", function (req, res) {
  const student_id = req.params.student_id;
  if (req.isAuthenticated()) {
    User.findOne({_id: student_id}, function(err, st){
      res.render('student/my-courses', {user: req.user, courses: st.purchase});
    })
  } else {
    res.redirect("/login");
  }
});
app.get("/teacher/:teach_id/courses", function (req, res) {
  const teach_id = req.params.teach_id;
  if (req.isAuthenticated()) {
    Course.find({ teacher: teach_id }, function (err, c) {
      res.render("teacher/courses", { user: req.user, courses: c });
    });
  } else {
    res.redirect("/login");
  }
});
app.get("/buy-course", function (req, res) {
  if (req.isAuthenticated()) {
    Course.find({}, function (err, c) {
      res.render("courses", { user: req.user, courses: c });
    });
  } else res.redirect("/login");
});

app.post("/payment/:course_id", function (req, res) {
  let user = req.user._id;
  const course_id = req.params.course_id;
  console.log("course_id: "+course_id)
  if(req.isAuthenticated())
  {
    User.find({_id: user}, function(e, u){

      Course.findOne({_id: course_id}, function(e, c){
        u[0].purchase.push(c);
        u[0].save(res.redirect('/buy-course'));
      })
    })
  }else {
    res.redirect("/login");
  }
});

app.get("/:user_id/verify", function (req, res) {
  const userID = req.params.user_id;
  if (req.isAuthenticated()) {
    res.render("verify", { user: req.user });
  }
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
app.get("/edit-profile/:id", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("edit-profile", { user: req.user });
  } else res.redirect("/login");
});
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/login");
});
app.get("/delete/:course_ID", function (req, res) {
  const c_ID = req.params.course_ID;
  if (req.isAuthenticated()) {
    Course.deleteOne({_id: c_ID}, function (err) {
      if (!err) res.redirect(`/teacher/${req.user._id}/courses`);
    });
  } else {
    res.redirect("/login");
  }
});
app.get("/update-course/:course_ID", function (req, res) {
  if (req.isAuthenticated()) {
    res.render(`update-course`);
  } else {
    res.redirect("/login");
  }
});
app.get("/:user_", function (req, res) {
  if (req.user.role === "teacher") res.redirect("/teacher/" + req.user._id);
  else if (req.user.role === "student")
    res.redirect("/student/" + req.user._id);
});
app.get("/view-course/:course_id", function (req, res) {
  let course_id = req.params.course_id;
  if (req.isAuthenticated()) {
    Course.find({ _id: course_id }, function (err, c) {
      console.log(c);
      res.render(`view-course`, { user: req.user, course: c });
    });
    res;
  } else {
    res.redirect("/login");
  }
});
app.post("/:user_id/verify", upload.single('identification'), function(req, res){
  const u_id = req.params.user_id
  if(req.isAuthenticated())
  {
    // User.updateOne({_id: u_id}, {identity: req.file.filename})
    console.log(req);
    res.redirect(`/teacher/${u_id}`)
  }else{
    res.redirect("/login")
  }
})
app.post("/update/:user_id", function (req, res) {
  const newName = req.body.name;
  const newEmail = req.body.name;
  const ID = req.params.user_id;
  if (req.isAuthenticated()) {
    User.updateOne(
      { _id: ID },
      { name: newName, username: newEmail },
      function (err) {
        if (!err) {
          if (req.user.role === "teacher") res.redirect(`/teacher/${ID}`);
          else if (req.user.role === "student") res.redirect(`/student/${ID}`);
        }
      }
    );
  }
});
app.post(
  "/teacher/:teach_id/add-course",
  upload.fields([{ name: "thumbnail", maxCount: 1 }, { name: "lecture" }]),
  function (req, res) {
    const t_id = req.params.teach_id;
    if (req.isAuthenticated()) {
      const course = new Course({
        title: req.body.title,
        price: req.body.price,
        description: req.body.desc,
        image: req.files.thumbnail[0].filename,
        teacher: req.user._id,
        // video: req.files.lecture[0].filename,
        teacherName: req.user.name,
      });
      let lecture_name = [];
      req.files.lecture.forEach((ele) => {
        lecture_name.push(ele.filename);
      });
      course.video.push({
        $each: lecture_name,
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
    { name: req.body.name, username: req.body.username, role: req.body.role , purchase: []},
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
app.listen(4000, function () {
  console.log("Server started at port 3000");
});
