const passport = require("passport");
const User = require("../models/user");
const Course = require("../models/course").Course;
const mongoose = require("mongoose");
const Video = require("../models/video").Video

exports.teacherDash = (req, res) => {
  const teach_id = req.params.teach_id;
  if (req.isAuthenticated()) {
    res.render("teacher/teacher-dash", { user: req.user });
  } else {
    res.redirect("/login");
  }
};
exports.myCourses = (req, res) => {
  const teach_id = req.params.teach_id;
  if (req.isAuthenticated()) {
    Course.find({ teacher: teach_id }, function (err, c) {
      res.render("teacher/courses", { user: req.user, courses: c });
    });
  } else {
    res.redirect("/login");
  }
};
exports.verifyGET = (req, res) => {
  const userID = req.params.user_id;
  if (req.isAuthenticated()) {
    res.render("verify", { user: req.user });
  }
};
exports.verifyPOST = (req, res) => {
  const u_id = req.params.user_id;
  if (req.isAuthenticated()) {
    // User.updateOne({_id: u_id}, {identity: req.file.filename})
    res.redirect(`/teacher/${u_id}`);
  } else {
    res.redirect("/login");
  }
};
exports.addCourse = (req, res) => {
  const teach_id = req.params.teach_id;
  if (req.isAuthenticated())
    res.render("teacher/upload-course", { user: req.user });
  else res.redirect("/login");
};
exports.addCoursePOST = (req, res) => {
  const t_id = req.params.teach_id;
  if (req.isAuthenticated()) {
    let lectures = [];
    req.files.lecture.forEach((ele) => {
      const video = new Video({
        title: ele.originalname,
        url: ele.filename,
        filetype: ele.mimetype
      })
      video.save()
      lectures.push(video);
    });
    const course = new Course({
      title: req.body.title,
      price: req.body.price,
      description: req.body.desc,
      image: req.files.thumbnail[0].filename,
      teacher: req.user._id,
      video: lectures,
      teacherName: req.user.name
    });
    console.log(course);
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
};
exports.deleteCourse = (req, res) => {
  const c_ID = req.params.course_ID;
  if (req.isAuthenticated()) {
    Course.deleteOne({ _id: c_ID }, function (err) {
      if (!err) res.redirect(`/teacher/${req.user._id}/courses`);
    });
  } else {
    res.redirect("/login");
  }
};
exports.updateCourse = (req, res) => {
  if (req.isAuthenticated()) {
    res.render(`teacher/update-course`, {
      user: req.user,
      course_id: req.params.course_ID,
    });
  } else {
    res.redirect("/login");
  }
};
exports.updateCourseThumbPOST = (req, res) => {
  console.log(req.body);
  if (req.isAuthenticated()) {
    Course.findOneAndUpdate(
      { _id: req.params.course_id },
      { $set: { image: req.files.thumbnail[0].filename } },
      { new: true },
      function (err, c) {
        if (err) console.log(err);
        else {
          res.redirect(`/teacher/${req.user._id}/courses`);
        }
      }
    );
  } else {
    res.redirect("/login");
  }
};
exports.updateCourseVideoPOST = (req, res) => {
  const s_id = req.params.course_id;
  if (req.isAuthenticated()) {
    let lecture_name = [];
    req.files.lecture.forEach((ele) => {
      lecture_name.push(ele.filename);
    });

    Course.findOne({ _id: s_id }, function (err, c) {
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
    });
  } else {
    res.redirect("/login");
  }
};
exports.updateCoursePricePOST = (req, res) => {
  if (req.isAuthenticated()) {
    Course.findOneAndUpdate(
      { _id: req.params.course_id },
      { $set: { price: req.body.price } },
      { new: true },
      function (err, c) {
        if (err) console.log(err);
        else {
          res.redirect(`/teacher/${req.user._id}/courses`);
        }
      }
    );
  } else {
    res.redirect("/login");
  }
};
exports.updateCourseDescPOST = (req, res) => {
  if (req.isAuthenticated()) {
    Course.findOneAndUpdate(
      { _id: req.params.course_id },
      { $set: { description: req.body.desc } },
      { new: true },
      function (err, c) {
        if (err) console.log(err);
        else {
          res.redirect(`/teacher/${req.user._id}/courses`);
        }
      }
    );
  } else {
    res.redirect("/login");
  }
};
exports.updateCourseNamePOST = (req, res) => {
  if (req.isAuthenticated()) {
    Course.findOneAndUpdate(
      { _id: req.params.course_id },
      { $set: { title: req.body.title } },
      { new: true },
      function (err, c) {
        if (err) console.log(err);
        else {
          res.redirect(`/teacher/${req.user._id}/courses`);
        }
      }
    );
  } else {
    res.redirect("/login");
  }
};
exports.viewCourse = (req, res) => {
  let course_id = req.params.course_id;
  if (req.isAuthenticated()) {
    Course.find({ _id: course_id }, function (err, c) {
      res.render(`view-course`, { user: req.user, course: c });
    });
    res;
  } else {
    res.redirect("/login");
  }
};
