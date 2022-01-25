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
const Course = require("./models/course").Course
const login = require('./routes/login')
const register = require('./routes/register')
const student = require('./routes/student')
const teacher = require('./routes/teacher')
const profile = require('./routes/profile');
const course = require("./models/course");

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
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  res.render("home");
});
app.get("/login", login.loginGET);
app.get("/register", register.registerGET);
app.get("/student/:stud_id", student.studentDash);
app.get("/student/:student_id/courses", student.myCourses);
app.get("/teacher/:teach_id", teacher.teacherDash);
app.get("/teacher/:teach_id/courses", teacher.myCourses);
app.get("/buy-course", student.buyCourse);
app.post("/payment/:course_id", student.pay);
app.get("/:user_id/verify", teacher.verifyGET);
app.get("/teacher/:teach_id/add-course", teacher.addCourse);
app.get("/profile/:id", profile.profileGET);
app.get("/edit-profile/:id", profile.editProfile);
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
    res.render(`teacher/update-course`, {user: req.user, course_id: req.params.course_ID});
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

app.post("/teacher/:course_id/update-course-name", function (req, res) {
    if (req.isAuthenticated()) {
       Course.findOneAndUpdate({_id: req.params.course_id}, {$set: {title: req.body.title}},{new: true}, function(err,c){
       if(err) console.log(err);
       else{
         res.redirect(`/teacher/${req.user._id}/courses`)
       }
     })
    } else {
      res.redirect("/login");
    }
  }
);

app.post("/teacher/:course_id/update-course-desc", function (req, res) {
    if (req.isAuthenticated()) {
       Course.findOneAndUpdate({_id: req.params.course_id}, {$set: {description: req.body.desc}},{new: true}, function(err,c){
       if(err) console.log(err);
       else{
          res.redirect(`/teacher/${req.user._id}/courses`);
       }
     })
    } else {
      res.redirect("/login");
    }
  }
);

app.post("/teacher/:course_id/update-course-price", function (req, res) {
    if (req.isAuthenticated()) {
       Course.findOneAndUpdate({_id: req.params.course_id}, {$set: {price: req.body.price}},{new: true}, function(err,c){
       if(err) console.log(err);
       else{
          res.redirect(`/teacher/${req.user._id}/courses`);
       }
     })
    } else {
      res.redirect("/login");
    }
  }
);


app.post("/teacher/:course_id/update-course-thumbnail",
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  function (req, res) {
    console.log(req.body)
    if (req.isAuthenticated()) {
       Course.findOneAndUpdate({_id: req.params.course_id}, {$set: {image: req.files.thumbnail[0].filename}},{new: true}, function(err,c){
       if(err) console.log(err);
       else{
          res.redirect(`/teacher/${req.user._id}/courses`);
       }
     })
    } else {
      res.redirect("/login");
    }
  }
);

app.post("/teacher/:course_id/add-course-video",
  upload.fields([{ name: "lecture" }]),
  function (req, res) {
    const s_id = req.params.course_id;
    if (req.isAuthenticated()) {

      let lecture_name = [];
      req.files.lecture.forEach((ele) => {
        lecture_name.push(ele.filename);
      });

      Course.findOne({_id: s_id}, function(err,c){
          c.video.push({
          $each: lecture_name,
        });

        c.save(function (err) {
        if (!err) {
          res.redirect(`/teacher/${req.user._id}/courses`);
        } else {
          console.log(err);
        }
      });
      }) 
    } else {
      res.redirect("/login");
    }
  }
);

app.post("/teacher/:teach_id/add-course",
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
app.post("/login", login.loginPOST);
app.post("/register", register.registerPOST);

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started at port 3000");
});
