const passport = require("passport")
const User = require("../models/user")
const mongoose = require("mongoose")

exports.studentDash = (req, res) => {
const stud_id = req.params.stud_id;
  if (req.isAuthenticated()) {
    res.render("student/student-dash", { user: req.user });
  } else {
    res.redirect("/login");
  }
}
exports.myCourses = (req, res) => {
const student_id = req.params.student_id;
  if (req.isAuthenticated()) {
    User.findOne({_id: student_id}, function(err, st){
      res.render('student/my-courses', {user: req.user, courses: st.purchase});
    })
  } else {
    res.redirect("/login");
  }
}
exports.buyCourse = (req, res) => {
  if (req.isAuthenticated()) {
    Course.find({}, function (err, c) {
      res.render("courses", { user: req.user, courses: c });
    });
  } else res.redirect("/login");
}
exports.pay = (req, res) => {
  let user = req.user._id;
  const course_id = req.params.course_id;
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
}
