require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const multer = require("multer");
const app = express();
const User = require("./models/user");
const login = require("./routes/login");
const register = require("./routes/register");
const student = require("./routes/student");
const teacher = require("./routes/teacher");
const profile = require("./routes/profile");

const axios = require("axios");
const cors = require('cors')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const Razorpay = require('razorpay')

app.use(cors());
app.use(express.json());
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

app.use(bodyParser.json());


app.use(express.static(__dirname + "/public"));
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
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./public/uploads/" + file.fieldname + "/";
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});
const upload = multer({
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
    } else {
      cb(null, false);
    }
  },
});

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
app.get("/payment/:course_id", student.pay);
app.get("/:user_id/verify", teacher.verifyGET);
app.get("/teacher/:teach_id/add-course", teacher.addCourse);
app.get("/profile/:id", profile.profileGET);
app.get("/edit-profile/:id", profile.editProfile);
app.get("/logout", login.logout);
app.get("/delete/:course_ID", teacher.deleteCourse);
app.get("/delete-my-course/:course_id", student.deleteMyCourse);
app.get("/update-course/:course_ID", teacher.updateCourse);
// app.get("/:user", function (req, res) {
//   if (req.user.role === "teacher") res.redirect("/teacher/" + req.user._id);
//   else if (req.user.role === "student")
//     res.redirect("/student/" + req.user._id);
// });
app.get("/view-course/:course_id", teacher.viewCourse);
app.post(
  "/:user_id/verify",
  upload.single("identification"),
  teacher.verifyPOST
);
app.post("/update/:user_id", profile.updateProfile);
app.post(
  "/teacher/:course_id/update-course-name",
  teacher.updateCourseNamePOST
);
app.post(
  "/teacher/:course_id/update-course-desc",
  teacher.updateCourseDescPOST
);
app.post(
  "/teacher/:course_id/update-course-price",
  teacher.updateCoursePricePOST
);
app.post(
  "/teacher/:course_id/update-course-thumbnail",
  upload.single('thumbnail'),
  teacher.updateCourseThumbPOST
);
app.post(
  "/teacher/:course_id/add-course-video",
  upload.array('lecture'),
  teacher.updateCourseVideoPOST
);
app.post(
  "/teacher/:teach_id/add-course",
  upload.fields([{ name: "thumbnail", maxCount: 1 }, { name: "lecture" }]),
  teacher.addCoursePOST
);
app.post("/login", login.loginPOST);
app.post("/register", register.registerPOST);

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started at port 3000");
});

// Razorpay
const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET
})

app.post('/order', ( req, res ) => {
  let options = req.body;
  razorpay.orders.create(options, (err, order) => {
      res.json(order)
  })
})

app.post('/is-order-complete/:course_id', ( req, res ) => {
  razorpay.payments.fetch(req.body.razorpay_payment_id).then((paymentDocument) => {  
    if(paymentDocument.status == 'captured') {
          console.log("Payment Successful");
          res.redirect(`/payment/${req.params.course_id}`);
      } else {
          res.redirect('/login');
      }
  })
})
