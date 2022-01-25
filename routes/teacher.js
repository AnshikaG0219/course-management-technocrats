const passport = require("passport")
const User = require("../models/user")
const Course = require("../models/course").Course
const mongoose = require("mongoose")

exports.teacherDash = (req, res) => {
    const teach_id = req.params.teach_id;
    if (req.isAuthenticated()) {
      res.render("teacher/teacher-dash", { user: req.user });
    } else {
      res.redirect("/login");
    }
}
exports.myCourses = (req, res) => {
    const teach_id = req.params.teach_id;
    if (req.isAuthenticated()) {
      Course.find({ teacher: teach_id }, function (err, c) {
        res.render("teacher/courses", { user: req.user, courses: c });
      });
    } else {
      res.redirect("/login");
    }
}
exports.verifyGET = (req, res) => {
    const userID = req.params.user_id;
  if (req.isAuthenticated()) {
    res.render("verify", { user: req.user });
  }
}
exports.addCourse = (req,res) =>{
    const teach_id = req.params.teach_id;
  if (req.isAuthenticated())
    res.render("teacher/upload-course", { user: req.user });
  else res.redirect("/login");
}